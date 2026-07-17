import { describe, it, expect } from 'vitest'
import { hasCoordinates, type Location } from '@/components/LocationMap/types'

function makeLocation(overrides: Partial<Location>): Location {
  return {
    id: '1',
    address: '123 Main St',
    business: { name: 'Test Business' },
    ...overrides,
  }
}

describe('hasCoordinates', () => {
  it('returns true when latitude and longitude are finite numbers', () => {
    expect(hasCoordinates(makeLocation({ latitude: 45.5, longitude: -122.6 }))).toBe(true)
  })

  it('returns false when latitude is null', () => {
    expect(hasCoordinates(makeLocation({ latitude: null, longitude: -122.6 }))).toBe(false)
  })

  it('returns false when longitude is undefined', () => {
    expect(hasCoordinates(makeLocation({ latitude: 45.5, longitude: undefined }))).toBe(false)
  })

  it('returns false when latitude is NaN', () => {
    expect(hasCoordinates(makeLocation({ latitude: NaN, longitude: -122.6 }))).toBe(false)
  })
})
