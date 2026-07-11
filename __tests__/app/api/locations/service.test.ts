import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getLocations, deleteLocation } from '@/app/api/locations/service'
import { mockLocationWithOffersRow, MOCK_LOCATION_ID, MOCK_BUSINESS_ID, MOCK_OFFER_ID } from '@/__mocks__/mockData'

vi.mock('@/app/api/locations/db', () => ({
  fetchLocationsWithOffers: vi.fn(),
  fetchLocationById: vi.fn(),
  insertLocation: vi.fn(),
  insertLocationHours: vi.fn(),
  updateLocationRow: vi.fn(),
  deleteLocationHours: vi.fn(),
  deleteOfferLocationsForLocation: vi.fn(),
  deleteLocationRow: vi.fn(),
}))

import {
  fetchLocationsWithOffers,
  deleteLocationHours,
  deleteOfferLocationsForLocation,
  deleteLocationRow,
} from '@/app/api/locations/db'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getLocations', () => {
  it('returns formatted locations on success', async () => {
    vi.mocked(fetchLocationsWithOffers).mockResolvedValue([mockLocationWithOffersRow])

    const result = await getLocations()

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(MOCK_LOCATION_ID)
    expect(result[0].business.id).toBe(MOCK_BUSINESS_ID)
    expect(result[0].address).toBe('123 Main St')
    expect(result[0].zip_code).toBe('97201')
    expect(result[0].location_hours).toHaveLength(1)
    expect(result[0].location_hours[0].day).toBe('monday')
    expect(result[0].offers).toHaveLength(1)
    expect(result[0].offers[0].id).toBe(MOCK_OFFER_ID)
    expect(result[0].offers[0].offer_hours[0].opens_at).toBe('08:00:00')
  })

  it('passes through nullable optional fields as-is', async () => {
    vi.mocked(fetchLocationsWithOffers).mockResolvedValue([mockLocationWithOffersRow])

    const [loc] = await getLocations()

    expect(loc.address2).toBeNull()
    expect(loc.neighborhood).toBeNull()
    expect(loc.phone_number).toBe('503-555-1234')
    expect(loc.latitude).toBe(45.523)
  })

  it('flattens offer_locations into a plain offers array', async () => {
    vi.mocked(fetchLocationsWithOffers).mockResolvedValue([mockLocationWithOffersRow])

    const [loc] = await getLocations()

    expect(loc).not.toHaveProperty('offer_locations')
    expect(loc.offers[0].name).toBe('Mock Offer')
  })

  it('filters out rows that fail schema validation', async () => {
    const invalidRow = { ...mockLocationWithOffersRow, address: null }
    vi.mocked(fetchLocationsWithOffers).mockResolvedValue([invalidRow, mockLocationWithOffersRow] as never)

    const result = await getLocations()

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(MOCK_LOCATION_ID)
  })

  it('throws when db returns an error', async () => {
    vi.mocked(fetchLocationsWithOffers).mockRejectedValue(new Error('DB error'))

    await expect(getLocations()).rejects.toThrow('DB error')
  })
})

describe('deleteLocation', () => {
  beforeEach(() => {
    vi.mocked(deleteLocationHours).mockResolvedValue(undefined)
    vi.mocked(deleteOfferLocationsForLocation).mockResolvedValue(undefined)
    vi.mocked(deleteLocationRow).mockResolvedValue(undefined)
  })

  it('clears hours and offer links before deleting the location row', async () => {
    await deleteLocation(MOCK_LOCATION_ID)

    expect(deleteLocationHours).toHaveBeenCalledWith(MOCK_LOCATION_ID)
    expect(deleteOfferLocationsForLocation).toHaveBeenCalledWith(MOCK_LOCATION_ID)
    expect(deleteLocationRow).toHaveBeenCalledWith(MOCK_LOCATION_ID)
  })

  it('throws when deleting hours fails', async () => {
    vi.mocked(deleteLocationHours).mockRejectedValue(new Error('Delete failed'))

    await expect(deleteLocation(MOCK_LOCATION_ID)).rejects.toThrow('Delete failed')
    expect(deleteLocationRow).not.toHaveBeenCalled()
  })

  it('throws when deleting the location row fails', async () => {
    vi.mocked(deleteLocationRow).mockRejectedValue(new Error('Delete failed'))

    await expect(deleteLocation(MOCK_LOCATION_ID)).rejects.toThrow('Delete failed')
  })
})
