import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { mockLocationWithOffers } from '@/__mocks__/mockData'

vi.mock('leaflet', () => ({
  default: {
    latLng: vi.fn((a: unknown, b?: unknown) => {
      const [lat, lng] = Array.isArray(a) ? a : [a, b]
      return { lat, lng, distanceTo: vi.fn(() => 0) }
    }),
    latLngBounds: vi.fn((points: unknown) => ({ points })),
  },
}))

const mockFitBounds = vi.fn()
const mockSetZoom = vi.fn()
const mockGetZoom = vi.fn(() => 12) // above MIN_INITIAL_ZOOM by default -- no clamp expected unless a test overrides this

vi.mock('react-leaflet', () => ({
  useMap: vi.fn(() => ({
    fitBounds: mockFitBounds,
    setZoom: mockSetZoom,
    getZoom: mockGetZoom,
  })),
}))

import InitialViewController from '@/components/LocationMap/InitialViewController'

beforeEach(() => {
  vi.clearAllMocks()
  mockGetZoom.mockReturnValue(12)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('InitialViewController', () => {
  it('calls geolocation when available', () => {
    const mockGetCurrentPosition = vi.fn()
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition: mockGetCurrentPosition },
    })

    render(<InitialViewController data={[]} />)

    expect(mockGetCurrentPosition).toHaveBeenCalled()
  })

  it('fits the map to the nearest results on geolocation success', () => {
    const mockGetCurrentPosition = vi.fn().mockImplementation((successFn: PositionCallback) => {
      successFn({ coords: { latitude: 45.5, longitude: -122.7 } } as GeolocationPosition)
    })
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition: mockGetCurrentPosition },
    })

    render(<InitialViewController data={[mockLocationWithOffers]} />)

    expect(mockFitBounds).toHaveBeenCalledWith(
      { points: [[mockLocationWithOffers.latitude, mockLocationWithOffers.longitude]] },
      { padding: [40, 40] },
    )
  })

  it('does not fit when there are no located results', () => {
    const mockGetCurrentPosition = vi.fn().mockImplementation((successFn: PositionCallback) => {
      successFn({ coords: { latitude: 45.5, longitude: -122.7 } } as GeolocationPosition)
    })
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition: mockGetCurrentPosition },
    })

    render(<InitialViewController data={[]} />)

    expect(mockFitBounds).not.toHaveBeenCalled()
  })

  it('clamps the zoom back up when fitBounds would zoom out past the floor', () => {
    mockGetZoom.mockReturnValue(5)
    const mockGetCurrentPosition = vi.fn().mockImplementation((successFn: PositionCallback) => {
      successFn({ coords: { latitude: 45.5, longitude: -122.7 } } as GeolocationPosition)
    })
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition: mockGetCurrentPosition },
    })

    render(<InitialViewController data={[mockLocationWithOffers]} />)

    expect(mockSetZoom).toHaveBeenCalledWith(9)
  })

  it('does not clamp when fitBounds already lands at or above the floor', () => {
    mockGetZoom.mockReturnValue(9)
    const mockGetCurrentPosition = vi.fn().mockImplementation((successFn: PositionCallback) => {
      successFn({ coords: { latitude: 45.5, longitude: -122.7 } } as GeolocationPosition)
    })
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition: mockGetCurrentPosition },
    })

    render(<InitialViewController data={[mockLocationWithOffers]} />)

    expect(mockSetZoom).not.toHaveBeenCalled()
  })

  it('falls back to the city center and still fits when geolocation fails', () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const mockGetCurrentPosition = vi.fn().mockImplementation(
      (_success: unknown, errorFn: PositionErrorCallback) => {
        errorFn({ message: 'Permission denied' } as GeolocationPositionError)
      },
    )
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition: mockGetCurrentPosition },
    })

    render(<InitialViewController data={[mockLocationWithOffers]} />)

    expect(consoleWarn).toHaveBeenCalledWith('Geolocation unavailable:', 'Permission denied')
    expect(mockFitBounds).toHaveBeenCalled()
    consoleWarn.mockRestore()
  })

  it('falls back to the city center and still fits when geolocation is unavailable', () => {
    vi.stubGlobal('navigator', { geolocation: undefined })

    expect(() => render(<InitialViewController data={[mockLocationWithOffers]} />)).not.toThrow()
    expect(mockFitBounds).toHaveBeenCalled()
  })

  it('only fits once even if the data prop changes afterward', () => {
    const mockGetCurrentPosition = vi.fn().mockImplementation((successFn: PositionCallback) => {
      successFn({ coords: { latitude: 45.5, longitude: -122.7 } } as GeolocationPosition)
    })
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition: mockGetCurrentPosition },
    })

    const { rerender } = render(<InitialViewController data={[mockLocationWithOffers]} />)
    expect(mockFitBounds).toHaveBeenCalledTimes(1)

    rerender(<InitialViewController data={[mockLocationWithOffers, mockLocationWithOffers]} />)
    expect(mockFitBounds).toHaveBeenCalledTimes(1)
  })
})
