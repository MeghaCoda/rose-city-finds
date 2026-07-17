import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { mockLocationWithOffers } from '@/__mocks__/mockData'

const mockLatLngToContainerPoint = vi.fn()
const mockMapContainer = document.createElement('div')

vi.mock('react-leaflet', () => ({
  useMap: vi.fn(() => ({
    latLngToContainerPoint: mockLatLngToContainerPoint,
    getContainer: () => mockMapContainer,
  })),
  useMapEvent: vi.fn(),
}))

import LabelCollisionController from '@/components/LocationMap/LabelCollisionController'

// A minimal stand-in for L.Marker: just enough of the API
// LabelCollisionController actually calls.
function fakeMarker(latlng: { lat: number; lng: number }, opts: { clustered?: boolean } = {}) {
  return {
    getElement: () => (opts.clustered ? undefined : document.createElement('div')),
    getLatLng: () => latlng,
  }
}

function fakeTooltip(el: HTMLElement) {
  return { getElement: () => el }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockMapContainer.innerHTML = ''
})

describe('LabelCollisionController', () => {
  it('shows labels for visible markers that do not collide on screen', () => {
    const a = { ...mockLocationWithOffers, id: 'a', latitude: 45.5, longitude: -122.6 }
    const b = { ...mockLocationWithOffers, id: 'b', latitude: 45.6, longitude: -122.7 }
    mockLatLngToContainerPoint.mockImplementation((latlng: { lat: number }) =>
      latlng.lat === 45.5 ? { x: 0, y: 0 } : { x: 1000, y: 1000 }
    )

    const tooltipElA = document.createElement('div')
    const tooltipElB = document.createElement('div')
    const markerRefs = { current: new Map([['a', fakeMarker({ lat: 45.5, lng: -122.6 })], ['b', fakeMarker({ lat: 45.6, lng: -122.7 })]]) }
    const tooltipRefs = { current: new Map([['a', fakeTooltip(tooltipElA)], ['b', fakeTooltip(tooltipElB)]]) }

    render(
      <LabelCollisionController
        data={[a, b]}
        markerRefs={markerRefs as never}
        tooltipRefs={tooltipRefs as never}
      />
    )

    expect(tooltipElA.style.display).toBe('')
    expect(tooltipElB.style.display).toBe('')
  })

  it('hides the label of a marker currently absorbed into a cluster (no rendered element)', () => {
    const a = { ...mockLocationWithOffers, id: 'a', latitude: 45.5, longitude: -122.6 }
    mockLatLngToContainerPoint.mockReturnValue({ x: 0, y: 0 })

    const tooltipElA = document.createElement('div')
    const markerRefs = { current: new Map([['a', fakeMarker({ lat: 45.5, lng: -122.6 }, { clustered: true })]]) }
    const tooltipRefs = { current: new Map([['a', fakeTooltip(tooltipElA)]]) }

    render(
      <LabelCollisionController
        data={[a]}
        markerRefs={markerRefs as never}
        tooltipRefs={tooltipRefs as never}
      />
    )

    // Never considered at all -- style is left untouched (not explicitly hidden).
    expect(tooltipElA.style.display).toBe('')
  })

  it('gives the selected marker priority, hiding the other label when they collide on screen', () => {
    const a = { ...mockLocationWithOffers, id: 'a', latitude: 45.5, longitude: -122.6 }
    const b = { ...mockLocationWithOffers, id: 'b', latitude: 45.6, longitude: -122.7 }
    // Both land at (nearly) the same screen point -- guaranteed collision.
    mockLatLngToContainerPoint.mockImplementation((latlng: { lat: number }) =>
      latlng.lat === 45.5 ? { x: 100, y: 100 } : { x: 105, y: 100 }
    )

    const tooltipElA = document.createElement('div')
    const tooltipElB = document.createElement('div')
    const markerRefs = { current: new Map([['a', fakeMarker({ lat: 45.5, lng: -122.6 })], ['b', fakeMarker({ lat: 45.6, lng: -122.7 })]]) }
    const tooltipRefs = { current: new Map([['a', fakeTooltip(tooltipElA)], ['b', fakeTooltip(tooltipElB)]]) }

    render(
      <LabelCollisionController
        data={[a, b]}
        selectedId="b"
        markerRefs={markerRefs as never}
        tooltipRefs={tooltipRefs as never}
      />
    )

    expect(tooltipElB.style.display).toBe('') // selected -- wins
    expect(tooltipElA.style.display).toBe('none') // loses the collision
  })
})
