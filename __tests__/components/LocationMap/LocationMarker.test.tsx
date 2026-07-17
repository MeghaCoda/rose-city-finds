import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { mockLocationWithOffers } from '@/__mocks__/mockData'

vi.mock('leaflet', () => ({
  default: {
    Icon: {
      Default: {
        prototype: {},
        mergeOptions: vi.fn(),
      },
    },
    divIcon: vi.fn(() => ({})),
  },
}))

vi.mock('react-leaflet', () => ({
  Marker: ({
    children,
    eventHandlers,
    ref,
  }: {
    children: React.ReactNode
    eventHandlers?: { click?: () => void }
    ref?: (marker: unknown) => void
  }) => {
    ref?.({ id: 'fake-marker' })
    return (
      <div data-testid="marker" onClick={eventHandlers?.click}>
        {children}
      </div>
    )
  },
  Popup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popup">{children}</div>
  ),
  Tooltip: ({
    children,
    ref,
  }: {
    children: React.ReactNode
    ref?: (tooltip: unknown) => void
  }) => {
    ref?.({ id: 'fake-tooltip' })
    return <div data-testid="tooltip">{children}</div>
  },
}))

import LocationMarker from '@/components/LocationMap/LocationMarker'

const locatedItem = { ...mockLocationWithOffers, latitude: 45.523, longitude: -122.6765 }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LocationMarker', () => {
  it('registers the marker in markerRefs on mount', () => {
    const markerRefs = { current: new Map() }
    const tooltipRefs = { current: new Map() }
    render(
      <LocationMarker
        item={locatedItem}
        highlighted={false}
        onSelect={vi.fn()}
        markerRefs={markerRefs}
        tooltipRefs={tooltipRefs}
      />
    )
    expect(markerRefs.current.get(locatedItem.id)).toEqual({ id: 'fake-marker' })
  })

  it('registers the tooltip in tooltipRefs on mount', () => {
    const markerRefs = { current: new Map() }
    const tooltipRefs = { current: new Map() }
    render(
      <LocationMarker
        item={locatedItem}
        highlighted={false}
        onSelect={vi.fn()}
        markerRefs={markerRefs}
        tooltipRefs={tooltipRefs}
      />
    )
    expect(tooltipRefs.current.get(locatedItem.id)).toEqual({ id: 'fake-tooltip' })
  })

  it('calls onSelect with the item when the marker is clicked', () => {
    const onSelect = vi.fn()
    const markerRefs = { current: new Map() }
    const tooltipRefs = { current: new Map() }
    render(
      <LocationMarker
        item={locatedItem}
        highlighted={false}
        onSelect={onSelect}
        markerRefs={markerRefs}
        tooltipRefs={tooltipRefs}
      />
    )
    fireEvent.click(screen.getByTestId('marker'))
    expect(onSelect).toHaveBeenCalledWith(locatedItem)
  })

  it('renders the business name in the tooltip', () => {
    const markerRefs = { current: new Map() }
    const tooltipRefs = { current: new Map() }
    render(
      <LocationMarker
        item={locatedItem}
        highlighted={false}
        onSelect={vi.fn()}
        markerRefs={markerRefs}
        tooltipRefs={tooltipRefs}
      />
    )
    expect(screen.getByTestId('tooltip')).toHaveTextContent(locatedItem.business.name)
  })

  it('renders the address and address2 in the popup when present', () => {
    const withAddress2 = { ...locatedItem, address2: 'Suite 4' }
    const markerRefs = { current: new Map() }
    const tooltipRefs = { current: new Map() }
    render(
      <LocationMarker
        item={withAddress2}
        highlighted={false}
        onSelect={vi.fn()}
        markerRefs={markerRefs}
        tooltipRefs={tooltipRefs}
      />
    )
    const popup = screen.getByTestId('popup')
    expect(popup).toHaveTextContent(locatedItem.address)
    expect(popup).toHaveTextContent('Suite 4')
  })
})
