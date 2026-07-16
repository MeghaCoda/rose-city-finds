import { describe, it, expect } from 'vitest'
import type L from 'leaflet'
import {
  boxesOverlap,
  computeVisibleLabelIds,
  getClusterBubbleBoxes,
  measureLabelWidth,
  type LabelBox,
  type ScreenLabel,
} from '@/components/LocationMap/labelCollision'

describe('boxesOverlap', () => {
  it('returns true for overlapping boxes', () => {
    const a: LabelBox = { left: 0, right: 10, top: 0, bottom: 10 }
    const b: LabelBox = { left: 5, right: 15, top: 5, bottom: 15 }
    expect(boxesOverlap(a, b)).toBe(true)
  })

  it('returns false for boxes separated horizontally', () => {
    const a: LabelBox = { left: 0, right: 10, top: 0, bottom: 10 }
    const b: LabelBox = { left: 20, right: 30, top: 0, bottom: 10 }
    expect(boxesOverlap(a, b)).toBe(false)
  })

  it('returns false for boxes separated vertically even when x-ranges overlap', () => {
    const a: LabelBox = { left: 0, right: 10, top: 0, bottom: 10 }
    const b: LabelBox = { left: 0, right: 10, top: 20, bottom: 30 }
    expect(boxesOverlap(a, b)).toBe(false)
  })
})

function label(id: string, x: number, y: number, width: number): ScreenLabel {
  return { id, point: { x, y } as unknown as L.Point, width }
}

describe('computeVisibleLabelIds', () => {
  it('shows every label when none of them collide', () => {
    const labels = [label('a', 0, 0, 50), label('b', 500, 0, 50)]
    expect(computeVisibleLabelIds(labels)).toEqual(new Set(['a', 'b']))
  })

  it('hides a later label that collides with an earlier (higher-priority) one', () => {
    // Both labels sit at nearly the same point with wide (150px) text --
    // guaranteed to collide regardless of the exact box math.
    const labels = [label('a', 100, 100, 150), label('b', 105, 100, 150)]
    const visible = computeVisibleLabelIds(labels)
    expect(visible.has('a')).toBe(true)
    expect(visible.has('b')).toBe(false)
  })

  it('is order-sensitive: whichever label is listed first wins the collision', () => {
    const labels = [label('b', 105, 100, 150), label('a', 100, 100, 150)]
    const visible = computeVisibleLabelIds(labels)
    expect(visible.has('b')).toBe(true)
    expect(visible.has('a')).toBe(false)
  })

  it('treats obstacles as pre-occupied space that blocks labels but is never itself hidden', () => {
    const labels = [label('a', 100, 100, 150)]
    const obstacles: LabelBox[] = [{ left: 50, right: 250, top: 50, bottom: 150 }]
    expect(computeVisibleLabelIds(labels, obstacles).has('a')).toBe(false)
  })

  it('shows a label that clears both other labels and obstacles', () => {
    const labels = [label('a', 1000, 1000, 50)]
    const obstacles: LabelBox[] = [{ left: 50, right: 250, top: 50, bottom: 150 }]
    expect(computeVisibleLabelIds(labels, obstacles).has('a')).toBe(true)
  })
})

describe('measureLabelWidth', () => {
  // jsdom's canvas 2D context isn't implemented without the optional
  // `canvas` package (not installed here), so this exercises the
  // length-based fallback -- still worth pinning down, since a crash here
  // would silently break LabelCollisionController for every marker.
  it('falls back to a length-based estimate when canvas measurement is unavailable', () => {
    expect(measureLabelWidth('abc')).toBe(3 * 7)
  })

  it('returns a larger width for longer text', () => {
    expect(measureLabelWidth('a much longer business name')).toBeGreaterThan(measureLabelWidth('abc'))
  })
})

describe('getClusterBubbleBoxes', () => {
  it('returns a box per .marker-cluster element, positioned relative to the container', () => {
    const container = document.createElement('div')
    Object.defineProperty(container, 'getBoundingClientRect', {
      value: () => ({ left: 100, top: 100, right: 300, bottom: 300, width: 200, height: 200, x: 100, y: 100, toJSON() {} }),
    })

    const bubble = document.createElement('div')
    bubble.className = 'marker-cluster'
    Object.defineProperty(bubble, 'getBoundingClientRect', {
      value: () => ({ left: 150, top: 150, right: 190, bottom: 190, width: 40, height: 40, x: 150, y: 150, toJSON() {} }),
    })
    container.appendChild(bubble)

    const notACluster = document.createElement('div')
    container.appendChild(notACluster)

    const map = { getContainer: () => container } as unknown as L.Map
    expect(getClusterBubbleBoxes(map)).toEqual([{ left: 50, right: 90, top: 50, bottom: 90 }])
  })

  it('returns an empty array when there are no cluster bubbles', () => {
    const container = document.createElement('div')
    Object.defineProperty(container, 'getBoundingClientRect', {
      value: () => ({ left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100, x: 0, y: 0, toJSON() {} }),
    })
    const map = { getContainer: () => container } as unknown as L.Map
    expect(getClusterBubbleBoxes(map)).toEqual([])
  })
})
