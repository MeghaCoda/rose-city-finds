import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { mockLocationWithOffers } from '@/__mocks__/mockData'

// ResourceMap's own job is composing MapContainer + MarkerClusterGroup +
// LocationMarker based on `data`/`selectedId`, and wiring the shared refs
// through to its controller children. Each of those children has its own
// dedicated test file now, so they're mocked out here rather than
// re-exercised -- this keeps the assertions below focused on ResourceMap's
// own orchestration logic (which items render, in what grouping, with what
// props) instead of re-testing geolocation/collision/selection internals
// at the integration level too.
vi.mock('leaflet/dist/leaflet.css', () => ({}))
vi.mock('react-leaflet-markercluster/styles', () => ({}))
vi.mock('@/components/LocationMap/LocationMap.css', () => ({}))

vi.mock('@/components/ProtomapsLayer', () => ({
  default: () => null,
}))

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
}))

vi.mock('react-leaflet-markercluster', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="cluster-group">{children}</div>
  ),
}))

vi.mock('@/components/LocationMap/ResizeController', () => ({ default: () => null }))
vi.mock('@/components/LocationMap/InitialViewController', () => ({ default: () => null }))
vi.mock('@/components/LocationMap/SelectionController', () => ({ default: () => null }))
vi.mock('@/components/LocationMap/LabelCollisionController', () => ({ default: () => null }))

vi.mock('@/components/LocationMap/LocationMarker', () => ({
  default: ({
    item,
    highlighted,
    onSelect,
  }: {
    item: typeof mockLocationWithOffers
    highlighted: boolean
    onSelect: (item: typeof mockLocationWithOffers) => void
  }) => (
    <div data-testid="marker" data-highlighted={highlighted} onClick={() => onSelect(item)}>
      <span data-testid="marker-name">{item.business.name}</span>
      <span data-testid="marker-address">{item.address}</span>
    </div>
  ),
}))

import ResourceMap from '@/components/LocationMap/LocationMap'

describe('ResourceMap', () => {
  it('renders the map container', () => {
    render(<ResourceMap onSelect={vi.fn()} data={[]} />)
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })

  it('renders a marker for each location', () => {
    const a = { ...mockLocationWithOffers, id: 'a' }
    const b = { ...mockLocationWithOffers, id: 'b' }
    render(<ResourceMap onSelect={vi.fn()} data={[a, b]} />)
    expect(screen.getAllByTestId('marker')).toHaveLength(2)
  })

  it('renders no markers when data is empty', () => {
    render(<ResourceMap onSelect={vi.fn()} data={[]} />)
    expect(screen.queryByTestId('marker')).not.toBeInTheDocument()
  })

  it('excludes locations without coordinates', () => {
    const noCoords = { ...mockLocationWithOffers, id: 'no-coords', latitude: null, longitude: null }
    render(<ResourceMap onSelect={vi.fn()} data={[noCoords]} />)
    expect(screen.queryByTestId('marker')).not.toBeInTheDocument()
  })

  it('calls onSelect with the location when a marker is clicked', () => {
    const onSelect = vi.fn()
    render(<ResourceMap onSelect={onSelect} data={[mockLocationWithOffers]} />)
    fireEvent.click(screen.getByTestId('marker'))
    expect(onSelect).toHaveBeenCalledWith(mockLocationWithOffers)
  })

  it('passes the correct item data down to each marker', () => {
    render(<ResourceMap onSelect={vi.fn()} data={[mockLocationWithOffers]} />)
    expect(screen.getByTestId('marker-name')).toHaveTextContent(mockLocationWithOffers.business.name)
    expect(screen.getByTestId('marker-address')).toHaveTextContent(mockLocationWithOffers.address)
  })

  it('renders exactly one highlighted marker, for the selected item', () => {
    const a = { ...mockLocationWithOffers, id: 'a' }
    const b = { ...mockLocationWithOffers, id: 'b' }
    render(<ResourceMap onSelect={vi.fn()} data={[a, b]} selectedId="b" />)

    const markers = screen.getAllByTestId('marker')
    expect(markers).toHaveLength(2)
    expect(markers.filter((m) => m.dataset.highlighted === 'true')).toHaveLength(1)
  })

  it('renders no highlighted marker when nothing is selected', () => {
    const a = { ...mockLocationWithOffers, id: 'a' }
    render(<ResourceMap onSelect={vi.fn()} data={[a]} />)

    expect(screen.getAllByTestId('marker').filter((m) => m.dataset.highlighted === 'true')).toHaveLength(0)
  })
})
