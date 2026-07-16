import { describe, it, expect } from 'vitest'
import { createLocationIcon, PIN_HEIGHT, PIN_WIDTH } from '@/components/LocationMap/markerIcon'

describe('createLocationIcon', () => {
  it('uses the base pin size and blue fill when not highlighted', () => {
    const icon = createLocationIcon(false)

    expect(icon.options.iconSize).toEqual([PIN_WIDTH, PIN_HEIGHT])
    expect(icon.options.iconAnchor).toEqual([PIN_WIDTH / 2, PIN_HEIGHT])
    expect(icon.options.html).toContain('#2563EB')
  })

  it('uses a 50% larger pin size and orange fill when highlighted', () => {
    const icon = createLocationIcon(true)

    expect(icon.options.iconSize).toEqual([PIN_WIDTH * 1.5, PIN_HEIGHT * 1.5])
    expect(icon.options.iconAnchor).toEqual([(PIN_WIDTH * 1.5) / 2, PIN_HEIGHT * 1.5])
    expect(icon.options.html).toContain('#E8612A')
  })

  it('anchors the tooltip vertically centered on the pin, scaled to the pin height', () => {
    expect(createLocationIcon(false).options.tooltipAnchor).toEqual([0, -PIN_HEIGHT / 2])
    expect(createLocationIcon(true).options.tooltipAnchor).toEqual([0, -(PIN_HEIGHT * 1.5) / 2])
  })
})
