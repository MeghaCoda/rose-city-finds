import { describe, it, expect } from 'vitest'
import { LocationSchema, LocationInputSchema, LocationUpdateSchema } from '@/schemas/zodSchema'
import { mockLocation, mockHours } from '@/__mocks__/mockData'

describe('LocationSchema', () => {
  it('accepts a valid location', () => {
    expect(LocationSchema.safeParse(mockLocation).success).toBe(true)
  })

  it('rejects missing required field: name', () => {
    const { name: _name, ...rest } = mockLocation
    expect(LocationSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects missing required field: address', () => {
    const { address: _address, ...rest } = mockLocation
    expect(LocationSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects non-string id', () => {
    expect(LocationSchema.safeParse({ ...mockLocation, id: 123 }).success).toBe(false)
  })

  it('rejects non-number latitude', () => {
    expect(LocationSchema.safeParse({ ...mockLocation, latitude: '45.523' }).success).toBe(false)
  })

  it('rejects invalid HH:MM time format in hours', () => {
    const result = LocationSchema.safeParse({
      ...mockLocation,
      hours: { ...mockHours, monday: [{ start: '8:00', end: '17:00' }] },
    })
    expect(result.success).toBe(false)
  })

  it('accepts optional fields when provided', () => {
    const result = LocationSchema.safeParse({
      ...mockLocation,
      address2: 'Suite 100',
      website: 'https://example.com',
      donationLink: 'https://donate.example.com',
      volunteerLink: 'https://volunteer.example.com',
      phoneNumber: '503-555-1234',
      notes: 'Some notes',
    })
    expect(result.success).toBe(true)
  })

  it('accepts optional fields when omitted', () => {
    const result = LocationSchema.safeParse(mockLocation)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.address2).toBeUndefined()
      expect(result.data.website).toBeUndefined()
    }
  })

  it('accepts empty string for website', () => {
    expect(LocationSchema.safeParse({ ...mockLocation, website: '' }).success).toBe(true)
  })

  it('rejects invalid URL for website', () => {
    expect(LocationSchema.safeParse({ ...mockLocation, website: 'not-a-url' }).success).toBe(false)
  })

  it('accepts empty string for donationLink', () => {
    expect(LocationSchema.safeParse({ ...mockLocation, donationLink: '' }).success).toBe(true)
  })

  it('rejects non-boolean deliveryAvailable', () => {
    expect(LocationSchema.safeParse({ ...mockLocation, deliveryAvailable: 'yes' }).success).toBe(false)
  })

  it('accepts multiple time slots per day', () => {
    const result = LocationSchema.safeParse({
      ...mockLocation,
      hours: {
        ...mockHours,
        monday: [
          { start: '08:00', end: '12:00' },
          { start: '13:00', end: '17:00' },
        ],
      },
    })
    expect(result.success).toBe(true)
  })
})

describe('LocationInputSchema', () => {
  it('accepts valid input without id and lastUpdated', () => {
    const { id: _id, lastUpdated: _lastUpdated, ...input } = mockLocation
    expect(LocationInputSchema.safeParse(input).success).toBe(true)
  })

  it('rejects missing required name', () => {
    const { id: _id, lastUpdated: _lastUpdated, name: _name, ...rest } = mockLocation
    expect(LocationInputSchema.safeParse(rest).success).toBe(false)
  })
})

describe('LocationUpdateSchema', () => {
  it('accepts an empty object (all fields optional)', () => {
    expect(LocationUpdateSchema.safeParse({}).success).toBe(true)
  })

  it('accepts a partial update with just name', () => {
    const result = LocationUpdateSchema.safeParse({ name: 'Updated Name' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Updated Name')
    }
  })

  it('accepts a partial update with coordinates', () => {
    const result = LocationUpdateSchema.safeParse({ latitude: 45.5, longitude: -122.7 })
    expect(result.success).toBe(true)
  })

  it('rejects invalid field type even in partial update', () => {
    expect(LocationUpdateSchema.safeParse({ latitude: 'not-a-number' }).success).toBe(false)
  })

  it('accepts partial hours update', () => {
    const result = LocationUpdateSchema.safeParse({
      hours: { ...mockHours, monday: [{ start: '09:00', end: '18:00' }] },
    })
    expect(result.success).toBe(true)
  })
})
