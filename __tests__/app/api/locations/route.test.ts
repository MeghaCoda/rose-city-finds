import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/locations/route'
import { mockLocation } from '@/__mocks__/mockData'

vi.mock('@/app/api/locations/service', () => ({
  getLocations: vi.fn(),
  createLocation: vi.fn(),
}))

import { getLocations, createLocation } from '@/app/api/locations/service'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/locations', () => {
  it('returns 200 with locations array on success', async () => {
    vi.mocked(getLocations).mockResolvedValue([mockLocation])

    const req = new NextRequest('http://localhost/api/locations')
    const response = await GET(req)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toHaveLength(1)
    expect(body[0].id).toBe('test-uuid-123')
  })

  it('returns 200 with empty array when no locations exist', async () => {
    vi.mocked(getLocations).mockResolvedValue([])

    const req = new NextRequest('http://localhost/api/locations')
    const response = await GET(req)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual([])
  })

  it('returns 500 with error message when service throws', async () => {
    vi.mocked(getLocations).mockRejectedValue(new Error('DB connection failed'))

    const req = new NextRequest('http://localhost/api/locations')
    const response = await GET(req)

    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.error).toBe('DB connection failed')
  })

  it('returns 500 with "Unknown error" when a non-Error is thrown', async () => {
    vi.mocked(getLocations).mockRejectedValue('plain string throw')

    const req = new NextRequest('http://localhost/api/locations')
    const response = await GET(req)

    expect(response.status).toBe(500)
    expect((await response.json()).error).toBe('Unknown error')
  })
})

describe('POST /api/locations', () => {
  const validInput = {
    name: 'New Location',
    address: '456 Oak Ave',
    city: 'Portland',
    state: 'OR',
    zipCode: '97202',
    latitude: 45.5,
    longitude: -122.7,
    offerDesc: 'Community meals',
    offerSource: 'https://example.com',
    deliveryAvailable: true,
    hours: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    },
    infoLastVerified: '2025-01-01',
    verificationStatus: 'pending',
  }

  it('returns 201 with created location on valid input', async () => {
    vi.mocked(createLocation).mockResolvedValue({ ...mockLocation, name: 'New Location' })

    const req = new NextRequest('http://localhost/api/locations', {
      method: 'POST',
      body: JSON.stringify(validInput),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await POST(req)

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.name).toBe('New Location')
  })

  it('returns 400 when required fields are missing', async () => {
    const req = new NextRequest('http://localhost/api/locations', {
      method: 'POST',
      body: JSON.stringify({ name: 'Incomplete' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await POST(req)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBeDefined()
  })

  it('returns 400 when body contains invalid field types', async () => {
    const req = new NextRequest('http://localhost/api/locations', {
      method: 'POST',
      body: JSON.stringify({ ...validInput, latitude: 'not-a-number' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await POST(req)

    expect(response.status).toBe(400)
  })

  it('returns 500 when service throws', async () => {
    vi.mocked(createLocation).mockRejectedValue(new Error('Insert failed'))

    const req = new NextRequest('http://localhost/api/locations', {
      method: 'POST',
      body: JSON.stringify(validInput),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await POST(req)

    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.error).toBe('Insert failed')
  })

  it('returns 500 with "Unknown error" when a non-Error is thrown', async () => {
    vi.mocked(createLocation).mockRejectedValue('plain string throw')

    const req = new NextRequest('http://localhost/api/locations', {
      method: 'POST',
      body: JSON.stringify(validInput),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await POST(req)

    expect(response.status).toBe(500)
    expect((await response.json()).error).toBe('Unknown error')
  })
})
