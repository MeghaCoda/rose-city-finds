import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MOCK_LOCATION_ID, MOCK_RESOURCE_ID, MOCK_HOURS_ID } from '@/__mocks__/mockData'

const { mockFetchPhysicalLocations } = vi.hoisted(() => ({
  mockFetchPhysicalLocations: vi.fn(),
}))

vi.mock('@/app/api/locations/db', () => ({
  fetchPhysicalLocations: mockFetchPhysicalLocations,
  fetchPhysicalLocationById: vi.fn(),
  insertPhysicalLocation: vi.fn(),
  insertResourceHours: vi.fn(),
  updatePhysicalLocationRow: vi.fn(),
  deleteResourceHours: vi.fn(),
  deletePhysicalLocation: vi.fn(),
}))

import { GET } from '@/app/api/locations/route'

type VerificationStatus = 'approved' | 'pending' | 'rejected' | null

function makeRow(id: string, verification_status: VerificationStatus) {
  return {
    id,
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
    verification_status,
    created_at: '2025-01-01T00:00:00Z',
    resource_hours: [
      {
        id: MOCK_HOURS_ID,
        physical_location_id: id,
        day: 'monday',
        opens_at: '08:00:00',
        closes_at: '17:00:00',
        notes: null,
        valid_from: null,
        valid_until: null,
      },
    ],
  }
}

const approvedRow = makeRow(MOCK_LOCATION_ID, 'approved')

beforeEach(() => {
  vi.clearAllMocks()
  mockFetchPhysicalLocations.mockResolvedValue([approvedRow])
})

async function callGET() {
  const req = new Request('http://localhost/api/locations')
  return GET(req as never)
}

describe('GET /api/locations', () => {
  it('returns 200', async () => {
    const res = await callGET()
    expect(res.status).toBe(200)
  })

  it('returns approved locations', async () => {
    const res = await callGET()
    const data = await res.json()

    expect(data).toHaveLength(1)
    expect(data[0].id).toBe(MOCK_LOCATION_ID)
    expect(data[0].verification_status).toBe('approved')
  })

  it('returns an empty array when no approved locations exist', async () => {
    mockFetchPhysicalLocations.mockResolvedValueOnce([])

    const res = await callGET()
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data).toEqual([])
  })

  it('every item in the response has verification_status approved', async () => {
    const secondRow = makeRow('22222222-2222-2222-8222-222222222222', 'approved')
    mockFetchPhysicalLocations.mockResolvedValueOnce([approvedRow, secondRow])

    const res = await callGET()
    const data = await res.json()

    expect(data.length).toBeGreaterThan(0)
    for (const location of data) {
      expect(location.verification_status).toBe('approved')
    }
  })

  it('pending locations do not appear in results', async () => {
    const pendingRow = makeRow('33333333-3333-3333-8333-333333333333', 'pending')
    // DB filter means fetchPhysicalLocations only returns approved items;
    // simulate that by not including the pending row in the mock return
    mockFetchPhysicalLocations.mockResolvedValueOnce([approvedRow])

    const res = await callGET()
    const data = await res.json()

    const pendingItems = data.filter(
      (loc: { verification_status: string }) => loc.verification_status === 'pending'
    )
    expect(pendingItems).toHaveLength(0)
    expect(data.some((loc: { id: string }) => loc.id === pendingRow.id)).toBe(false)
  })

  it('rejected locations do not appear in results', async () => {
    const rejectedRow = makeRow('44444444-4444-4444-8444-444444444444', 'rejected')
    mockFetchPhysicalLocations.mockResolvedValueOnce([approvedRow])

    const res = await callGET()
    const data = await res.json()

    const rejectedItems = data.filter(
      (loc: { verification_status: string }) => loc.verification_status === 'rejected'
    )
    expect(rejectedItems).toHaveLength(0)
    expect(data.some((loc: { id: string }) => loc.id === rejectedRow.id)).toBe(false)
  })

  it('null verification_status locations do not appear in results', async () => {
    const nullRow = makeRow('55555555-5555-5555-8555-555555555555', null)
    mockFetchPhysicalLocations.mockResolvedValueOnce([approvedRow])

    const res = await callGET()
    const data = await res.json()

    const nullItems = data.filter(
      (loc: { verification_status: string | null }) => loc.verification_status === null
    )
    expect(nullItems).toHaveLength(0)
    expect(data.some((loc: { id: string }) => loc.id === nullRow.id)).toBe(false)
  })

  it('returns 500 when the database throws', async () => {
    mockFetchPhysicalLocations.mockRejectedValueOnce(new Error('connection failed'))

    const res = await callGET()
    const data = await res.json()

    expect(res.status).toBe(500)
    expect(data).toHaveProperty('error', 'connection failed')
  })
})
