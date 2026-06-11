import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getLocations, deleteLocation } from '@/app/api/locations/service'
import { mockDbRow } from '@/__mocks__/mockData'

vi.mock('@/app/api/locations/db', () => ({
  fetchActiveLocations: vi.fn(),
  fetchLocationById: vi.fn(),
  insertLocation: vi.fn(),
  insertLocationHours: vi.fn(),
  updateLocationRow: vi.fn(),
  deleteLocationHours: vi.fn(),
  softDeleteLocation: vi.fn(),
}))

import {
  fetchActiveLocations,
  softDeleteLocation,
} from '@/app/api/locations/db'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getLocations', () => {
  it('returns formatted locations on success', async () => {
    vi.mocked(fetchActiveLocations).mockResolvedValue([mockDbRow])

    const result = await getLocations()

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('test-uuid-123')
    expect(result[0].name).toBe('Test Food Bank')
    expect(result[0].zipCode).toBe('97201')
    expect(result[0].hours.monday).toEqual([{ start: '08:00', end: '17:00' }])
  })

  it('maps null optional fields to safe defaults', async () => {
    vi.mocked(fetchActiveLocations).mockResolvedValue([mockDbRow])

    const [loc] = await getLocations()

    expect(loc.website).toBeUndefined()
    expect(loc.donationLink).toBeUndefined()
    expect(loc.deliveryAvailable).toBe(false)
    expect(loc.address2).toBe('')
    expect(loc.notes).toBe('')
  })

  it('filters out rows that fail schema validation', async () => {
    const invalidRow = { ...mockDbRow, name: null } // name is required
    vi.mocked(fetchActiveLocations).mockResolvedValue([invalidRow, mockDbRow])

    const result = await getLocations()

    // Only the valid row should be returned.
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('test-uuid-123')
  })

  it('throws when db returns an error', async () => {
    vi.mocked(fetchActiveLocations).mockRejectedValue(new Error('DB error'))

    await expect(getLocations()).rejects.toThrow('DB error')
  })
})

describe('deleteLocation', () => {
  it('delegates to softDeleteLocation', async () => {
    vi.mocked(softDeleteLocation).mockResolvedValue(undefined)

    await deleteLocation('test-uuid-123')

    expect(softDeleteLocation).toHaveBeenCalledWith('test-uuid-123')
  })

  it('throws when db returns an error', async () => {
    vi.mocked(softDeleteLocation).mockRejectedValue(new Error('Delete failed'))

    await expect(deleteLocation('bad-id')).rejects.toThrow('Delete failed')
  })
})
