import { describe, it, expect, vi } from 'vitest'
import L from 'leaflet'
import { flyToSafe } from '@/components/LocationMap/mapMotion'

function makeMockMap(size: { x: number; y: number }) {
  return {
    getSize: vi.fn(() => size),
    setView: vi.fn(),
    flyTo: vi.fn(),
  } as unknown as L.Map & { setView: ReturnType<typeof vi.fn>; flyTo: ReturnType<typeof vi.fn> }
}

describe('flyToSafe', () => {
  it('flies normally when the container has a nonzero size', () => {
    const map = makeMockMap({ x: 800, y: 600 })
    const target: L.LatLngExpression = [45.5, -122.6]

    flyToSafe(map, target, 14, { animate: true, duration: 1 })

    expect(map.flyTo).toHaveBeenCalledWith(target, 14, { animate: true, duration: 1 })
    expect(map.setView).not.toHaveBeenCalled()
  })

  it('jumps instantly instead of flying when the container width is zero', () => {
    const map = makeMockMap({ x: 0, y: 600 })
    const target: L.LatLngExpression = [45.5, -122.6]

    flyToSafe(map, target, 14, { animate: true, duration: 1 })

    expect(map.setView).toHaveBeenCalledWith(target, 14, { animate: false })
    expect(map.flyTo).not.toHaveBeenCalled()
  })

  it('jumps instantly instead of flying when the container height is zero', () => {
    const map = makeMockMap({ x: 800, y: 0 })
    const target: L.LatLngExpression = [45.5, -122.6]

    flyToSafe(map, target, 14, { animate: true, duration: 1 })

    expect(map.setView).toHaveBeenCalledWith(target, 14, { animate: false })
    expect(map.flyTo).not.toHaveBeenCalled()
  })
})
