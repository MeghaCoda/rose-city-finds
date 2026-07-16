import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { mockLocationWithOffers } from '@/__mocks__/mockData'

vi.mock('leaflet', () => ({
  default: {
    latLng: vi.fn((a: unknown, b?: unknown) => {
      const [lat, lng] = Array.isArray(a) ? a : [a, b]
      return { lat, lng, distanceTo: mockDistanceTo }
    }),
  },
}))

const mockDistanceTo = vi.fn(() => 0)
const mockFlyTo = vi.fn()
const mockSetView = vi.fn()
const mockGetSize = vi.fn(() => ({ x: 800, y: 600 }))
const mockGetCenter = vi.fn(() => ({ distanceTo: mockDistanceTo }))
const mockGetZoom = vi.fn(() => 13)

vi.mock('react-leaflet', () => ({
  useMap: vi.fn(() => ({
    getCenter: mockGetCenter,
    getZoom: mockGetZoom,
    getSize: mockGetSize,
    flyTo: mockFlyTo,
    setView: mockSetView,
  })),
}))

import SelectionController from '@/components/LocationMap/SelectionController'

beforeEach(() => {
  vi.clearAllMocks()
  mockGetSize.mockReturnValue({ x: 800, y: 600 })
  mockGetCenter.mockReturnValue({ distanceTo: mockDistanceTo })
  mockGetZoom.mockReturnValue(13)
  mockDistanceTo.mockReturnValue(0)
})

describe('SelectionController', () => {
  it('does nothing when selectedId is not provided', () => {
    render(<SelectionController data={[mockLocationWithOffers]} />)
    expect(mockFlyTo).not.toHaveBeenCalled()
    expect(mockSetView).not.toHaveBeenCalled()
  })

  it('does nothing when the selected item is not found in data', () => {
    render(<SelectionController data={[mockLocationWithOffers]} selectedId="does-not-exist" />)
    expect(mockFlyTo).not.toHaveBeenCalled()
  })

  it('does nothing when the selected item lacks coordinates', () => {
    const noCoords = { ...mockLocationWithOffers, latitude: null, longitude: null }
    render(<SelectionController data={[noCoords]} selectedId={noCoords.id} />)
    expect(mockFlyTo).not.toHaveBeenCalled()
  })

  it('flies to the selected item at the default duration when nearby', () => {
    mockDistanceTo.mockReturnValue(1000) // well under the long-flight threshold
    render(<SelectionController data={[mockLocationWithOffers]} selectedId={mockLocationWithOffers.id} />)

    expect(mockFlyTo).toHaveBeenCalledWith(
      expect.objectContaining({ lat: mockLocationWithOffers.latitude, lng: mockLocationWithOffers.longitude }),
      13,
      { animate: true, duration: 0.75 },
    )
  })

  it('uses the longer flight duration when the selected item is far away', () => {
    mockDistanceTo.mockReturnValue(20_000) // beyond the 16km long-flight threshold
    render(<SelectionController data={[mockLocationWithOffers]} selectedId={mockLocationWithOffers.id} />)

    expect(mockFlyTo).toHaveBeenCalledWith(
      expect.objectContaining({ lat: mockLocationWithOffers.latitude, lng: mockLocationWithOffers.longitude }),
      13,
      { animate: true, duration: 1.5 },
    )
  })

  it('jumps instantly instead of flying when the map container has zero size', () => {
    mockGetSize.mockReturnValue({ x: 0, y: 0 })
    render(<SelectionController data={[mockLocationWithOffers]} selectedId={mockLocationWithOffers.id} />)

    expect(mockSetView).toHaveBeenCalledWith(
      expect.objectContaining({ lat: mockLocationWithOffers.latitude, lng: mockLocationWithOffers.longitude }),
      13,
      { animate: false },
    )
    expect(mockFlyTo).not.toHaveBeenCalled()
  })
})
