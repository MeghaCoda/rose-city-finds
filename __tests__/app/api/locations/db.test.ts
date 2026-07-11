import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchLocationsWithOffers,
  fetchLocationById,
  insertLocation,
  insertLocationHours,
  updateLocationRow,
  deleteLocationHours,
  deleteOfferLocationsForLocation,
  deleteLocationRow,
} from '@/app/api/locations/db'
import { mockLocationWithOffersRow, MOCK_LOCATION_ID, MOCK_BUSINESS_ID } from '@/__mocks__/mockData'

// Builds a chainable, awaitable Supabase query builder mock.
function makeBuilder(result: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {}
  const chain = () => builder
  builder.select = vi.fn(chain)
  builder.insert = vi.fn(chain)
  builder.update = vi.fn(chain)
  builder.delete = vi.fn(chain)
  builder.eq = vi.fn(chain)
  builder.single = vi.fn(() => Promise.resolve(result))
  // Make the builder itself awaitable (supabase-js query builders are PromiseLike).
  builder.then = (
    resolve: (v: unknown) => unknown,
    reject: (e: unknown) => unknown
  ) => Promise.resolve(result).then(resolve, reject)
  return builder
}

const mockFrom = vi.fn()

vi.mock('@/lib/supabase', () => ({
  createSupabaseClient: () => ({ from: mockFrom }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('fetchLocationsWithOffers', () => {
  it('returns rows on success', async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: [mockLocationWithOffersRow], error: null }))

    const result = await fetchLocationsWithOffers()

    expect(result).toEqual([mockLocationWithOffersRow])
    expect(mockFrom).toHaveBeenCalledWith('locations')
  })

  it('selects with business/location_hours/offer joins', async () => {
    const builder = makeBuilder({ data: [mockLocationWithOffersRow], error: null })
    mockFrom.mockReturnValue(builder)

    await fetchLocationsWithOffers()

    expect(builder.select).toHaveBeenCalledWith(
      '*, business:businesses(*), location_hours(*), offer_locations(offers(*, offer_hours(*)))'
    )
  })

  it('throws when Supabase returns an error', async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: { message: 'DB error' } }))

    await expect(fetchLocationsWithOffers()).rejects.toThrow('DB error')
  })
})

describe('fetchLocationById', () => {
  it('returns a single row on success', async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: mockLocationWithOffersRow, error: null }))

    const result = await fetchLocationById(MOCK_LOCATION_ID)

    expect(result).toEqual(mockLocationWithOffersRow)
    expect(mockFrom).toHaveBeenCalledWith('locations')
  })

  it('selects with location_hours join', async () => {
    const builder = makeBuilder({ data: mockLocationWithOffersRow, error: null })
    mockFrom.mockReturnValue(builder)

    await fetchLocationById(MOCK_LOCATION_ID)

    expect(builder.select).toHaveBeenCalledWith('*, location_hours(*)')
  })

  it('throws when Supabase returns an error', async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: { message: 'Not found' } }))

    await expect(fetchLocationById('bad-id')).rejects.toThrow('Not found')
  })
})

describe('insertLocation', () => {
  it('returns the new row id on success', async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: { id: 'new-uuid' }, error: null }))

    const result = await insertLocation({
      business_id: MOCK_BUSINESS_ID,
      address: '123 St',
      city: 'Portland',
      state: 'OR',
      zip_code: '97201',
      address2: null,
      neighborhood: null,
      latitude: 45.523,
      longitude: -122.6765,
      phone_number: null,
      food_formats: ['pickup'],
      verification_status: 'pending',
      notes: null,
    })

    expect(result).toEqual({ id: 'new-uuid' })
    expect(mockFrom).toHaveBeenCalledWith('locations')
  })

  it('throws when Supabase returns an error', async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: { message: 'Insert failed' } }))

    await expect(insertLocation({} as never)).rejects.toThrow('Insert failed')
  })
})

describe('insertLocationHours', () => {
  it('inserts hours without throwing on success', async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: null }))

    await expect(
      insertLocationHours([{
        location_id: MOCK_LOCATION_ID,
        day: 'monday',
        opens_at: '08:00:00',
        closes_at: '17:00:00',
        notes: null,
        valid_from: null,
        valid_until: null,
      }])
    ).resolves.toBeUndefined()

    expect(mockFrom).toHaveBeenCalledWith('location_hours')
  })

  it('throws when Supabase returns an error', async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: { message: 'Hours insert failed' } }))

    await expect(insertLocationHours([])).rejects.toThrow('Hours insert failed')
  })
})

describe('updateLocationRow', () => {
  it('updates without throwing on success', async () => {
    const builder = makeBuilder({ data: null, error: null })
    mockFrom.mockReturnValue(builder)

    await updateLocationRow(MOCK_LOCATION_ID, { address: 'New Address' })

    expect(mockFrom).toHaveBeenCalledWith('locations')
    expect(builder.update).toHaveBeenCalledWith({ address: 'New Address' })
    expect(builder.eq).toHaveBeenCalledWith('id', MOCK_LOCATION_ID)
  })

  it('throws when Supabase returns an error', async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: { message: 'Update failed' } }))

    await expect(updateLocationRow('bad-id', {})).rejects.toThrow('Update failed')
  })
})

describe('deleteLocationHours', () => {
  it('deletes hours without throwing on success', async () => {
    const builder = makeBuilder({ data: null, error: null })
    mockFrom.mockReturnValue(builder)

    await deleteLocationHours(MOCK_LOCATION_ID)

    expect(mockFrom).toHaveBeenCalledWith('location_hours')
    expect(builder.delete).toHaveBeenCalled()
    expect(builder.eq).toHaveBeenCalledWith('location_id', MOCK_LOCATION_ID)
  })

  it('throws when Supabase returns an error', async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: { message: 'Delete failed' } }))

    await expect(deleteLocationHours('bad-id')).rejects.toThrow('Delete failed')
  })
})

describe('deleteOfferLocationsForLocation', () => {
  it('deletes offer links without throwing on success', async () => {
    const builder = makeBuilder({ data: null, error: null })
    mockFrom.mockReturnValue(builder)

    await deleteOfferLocationsForLocation(MOCK_LOCATION_ID)

    expect(mockFrom).toHaveBeenCalledWith('offer_locations')
    expect(builder.delete).toHaveBeenCalled()
    expect(builder.eq).toHaveBeenCalledWith('location_id', MOCK_LOCATION_ID)
  })

  it('throws when Supabase returns an error', async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: { message: 'Delete failed' } }))

    await expect(deleteOfferLocationsForLocation('bad-id')).rejects.toThrow('Delete failed')
  })
})

describe('deleteLocationRow', () => {
  it('deletes the location without throwing on success', async () => {
    const builder = makeBuilder({ data: null, error: null })
    mockFrom.mockReturnValue(builder)

    await deleteLocationRow(MOCK_LOCATION_ID)

    expect(mockFrom).toHaveBeenCalledWith('locations')
    expect(builder.delete).toHaveBeenCalled()
    expect(builder.eq).toHaveBeenCalledWith('id', MOCK_LOCATION_ID)
  })

  it('throws when Supabase returns an error', async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: { message: 'Delete failed' } }))

    await expect(deleteLocationRow('bad-id')).rejects.toThrow('Delete failed')
  })
})
