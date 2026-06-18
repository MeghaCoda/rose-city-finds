import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MOCK_LOCATION_ID, MOCK_RESOURCE_ID, MOCK_HOURS_ID } from '@/__mocks__/mockData'

const { mockEq, mockSelect, mockFrom } = vi.hoisted(() => {
  const mockEq = vi.fn()
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
  const mockFrom = vi.fn().mockReturnValue({ select: mockSelect })
  return { mockEq, mockSelect, mockFrom }
})

vi.mock('@/lib/supabase', () => ({
  createSupabaseClient: () => ({ from: mockFrom }),
}))

import { fetchPhysicalLocations } from '@/app/api/locations/db'

const approvedRow = {
  id: MOCK_LOCATION_ID,
  resource_id: MOCK_RESOURCE_ID,
  address: '123 Main St',
  address2: null,
  city: 'Portland',
  state: 'OR',
  zip_code: '97201',
  neighborhood: null,
  latitude: 45.523,
  longitude: -122.6765,
  phone_number: '503-555-1234',
  verification_status: 'approved',
  created_at: '2025-01-01T00:00:00Z',
  resource_hours: [
    {
      id: MOCK_HOURS_ID,
      physical_location_id: MOCK_LOCATION_ID,
      day: 'monday',
      opens_at: '08:00:00',
      closes_at: '17:00:00',
      notes: null,
      valid_from: null,
      valid_until: null,
    },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
  mockEq.mockResolvedValue({ data: [approvedRow], error: null })
})

describe('fetchPhysicalLocations', () => {
  it('queries the physical_locations table', async () => {
    await fetchPhysicalLocations()
    expect(mockFrom).toHaveBeenCalledWith('physical_locations')
  })

  it('includes resource_hours in the select', async () => {
    await fetchPhysicalLocations()
    expect(mockSelect).toHaveBeenCalledWith('*, resource_hours(*)')
  })

  it('filters by verification_status approved', async () => {
    await fetchPhysicalLocations()
    expect(mockEq).toHaveBeenCalledWith('verification_status', 'approved')
  })

  it('does not query for pending items', async () => {
    await fetchPhysicalLocations()
    expect(mockEq).not.toHaveBeenCalledWith('verification_status', 'pending')
  })

  it('does not query for rejected items', async () => {
    await fetchPhysicalLocations()
    expect(mockEq).not.toHaveBeenCalledWith('verification_status', 'rejected')
  })

  it('returns the data from the query', async () => {
    const result = await fetchPhysicalLocations()
    expect(result).toEqual([approvedRow])
  })

  it('throws when Supabase returns an error', async () => {
    mockEq.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } })
    await expect(fetchPhysicalLocations()).rejects.toThrow('DB error')
  })
})
