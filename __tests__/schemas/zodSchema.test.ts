import { describe, it, expect } from 'vitest'
import {
  LocationInputSchema,
  LocationUpdateSchema,
} from '@/app/api/locations/schemas'
import { mockLocationWithOffers } from '@/__mocks__/mockData'

// Input-shaped fixture for LocationInputSchema/LocationUpdateSchema: the
// writable location fields, without id/business/offers/location_hours.
const { id: _mockLocId, business: _mockBusiness, offers: _mockOffers, location_hours: _mockLocHours, ...mockLocationInput } = mockLocationWithOffers

describe('LocationInputSchema', () => {
  it('accepts valid input without id', () => {
    expect(LocationInputSchema.safeParse(mockLocationInput).success).toBe(true)
  })

  it('rejects missing required address', () => {
    const { address: _addr, ...rest } = mockLocationInput
    expect(LocationInputSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects missing required business_id', () => {
    const { business_id: _bid, ...rest } = mockLocationInput
    expect(LocationInputSchema.safeParse(rest).success).toBe(false)
  })

  it('accepts location_hours array', () => {
    const result = LocationInputSchema.safeParse({
      ...mockLocationInput,
      location_hours: [
        { day: 'monday', opens_at: '08:00', closes_at: '17:00' },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('accepts missing location_hours (optional)', () => {
    expect(LocationInputSchema.safeParse(mockLocationInput).success).toBe(true)
  })

  it('rejects invalid opens_at time format in location_hours', () => {
    const result = LocationInputSchema.safeParse({
      ...mockLocationInput,
      location_hours: [{ day: 'monday', opens_at: '8:00', closes_at: '17:00' }],
    })
    expect(result.success).toBe(false)
  })
})

describe('LocationUpdateSchema', () => {
  it('accepts an empty object (all fields optional)', () => {
    expect(LocationUpdateSchema.safeParse({}).success).toBe(true)
  })

  it('accepts a partial update with just address', () => {
    const result = LocationUpdateSchema.safeParse({ address: '456 New Ave' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.address).toBe('456 New Ave')
    }
  })

  it('accepts a partial update with coordinates', () => {
    const result = LocationUpdateSchema.safeParse({ latitude: 45.5, longitude: -122.7 })
    expect(result.success).toBe(true)
  })

  it('rejects invalid field type even in partial update', () => {
    expect(LocationUpdateSchema.safeParse({ latitude: 'not-a-number' }).success).toBe(false)
  })

  it('accepts partial update with location_hours', () => {
    const result = LocationUpdateSchema.safeParse({
      location_hours: [{ day: 'tuesday', opens_at: '09:00', closes_at: '18:00' }],
    })
    expect(result.success).toBe(true)
  })
})
