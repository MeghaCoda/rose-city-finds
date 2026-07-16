import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'

const mockInvalidateSize = vi.fn()
const mockGetContainer = vi.fn(() => document.createElement('div'))

vi.mock('react-leaflet', () => ({
  useMap: vi.fn(() => ({
    getContainer: mockGetContainer,
    invalidateSize: mockInvalidateSize,
  })),
}))

let observedCallback: (() => void) | undefined
const disconnectSpy = vi.fn()

class MockResizeObserver {
  constructor(callback: () => void) {
    observedCallback = callback
  }
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = disconnectSpy
}

import ResizeController from '@/components/LocationMap/ResizeController'

beforeEach(() => {
  vi.clearAllMocks()
  observedCallback = undefined
  vi.stubGlobal('ResizeObserver', MockResizeObserver)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ResizeController', () => {
  it('observes the map container', () => {
    render(<ResizeController />)
    expect(mockGetContainer).toHaveBeenCalled()
  })

  it('calls map.invalidateSize() when the observed container resizes', () => {
    render(<ResizeController />)
    expect(observedCallback).toBeDefined()

    observedCallback!()

    expect(mockInvalidateSize).toHaveBeenCalledTimes(1)
  })

  it('disconnects the observer on unmount', () => {
    const { unmount } = render(<ResizeController />)
    unmount()
    expect(disconnectSpy).toHaveBeenCalledTimes(1)
  })
})
