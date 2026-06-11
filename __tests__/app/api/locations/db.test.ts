import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchActiveLocations,
  fetchLocationById,
  insertLocation,
  insertLocationHours,
  updateLocationRow,
  deleteLocationHours,
  softDeleteLocation,
} from '@/app/api/locations/db'
import { mockDbRow } from '@/__mocks__/mockData'

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

describe('fetchActiveLocations', () => {
  it('returns rows on success', async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: [mockDbRow], error: null }))

    const result = await fetchActiveLocations()

    expect(result).toEqual([mockDbRow])
    expect(mockFrom).toHaveBeenCalledWith('locations')
  })

  it('throws when Supabase returns an error', async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: { message: 'DB error' } }))

    await expect(fetchActiveLocations()).rejects.toThrow('DB error')
  })
})

describe('fetchLocationById', () => {
  it('returns a single row on success', async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: mockDbRow, error: null }))

    const result = await fetchLocationById('test-uuid-123')

    expect(result).toEqual(mockDbRow)
    expect(mockFrom).toHaveBeenCalledWith('locations')
  })

  it('throws when Supabase returns an error', async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: { message: 'Not found' } }))

    await expect(fetchLocationById('bad-id')).rejects.toThrow('Not found')
  })
})

describe('insertLocation', () => {
  it('returns the new row id on success', async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: { id: 'new-uuid' }, error: null }))

    const result = await insertLocation({ name: 'Test', address: '123 St', city: 'Portland', state: 'OR' } as never)

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
      insertLocationHours([{ location_id: 'uuid', day: 'monday', opens_at: '08:00:00', closes_at: '17:00:00' }])
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

    await updateLocationRow('test-uuid-123', { name: 'Updated Name' })

    expect(mockFrom).toHaveBeenCalledWith('locations')
    expect(builder.update).toHaveBeenCalledWith({ name: 'Updated Name' })
    expect(builder.eq).toHaveBeenCalledWith('id', 'test-uuid-123')
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

    await deleteLocationHours('test-uuid-123')

    expect(mockFrom).toHaveBeenCalledWith('location_hours')
    expect(builder.delete).toHaveBeenCalled()
    expect(builder.eq).toHaveBeenCalledWith('location_id', 'test-uuid-123')
  })

  it('throws when Supabase returns an error', async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: { message: 'Delete failed' } }))

    await expect(deleteLocationHours('bad-id')).rejects.toThrow('Delete failed')
  })
})

describe('softDeleteLocation', () => {
  it('calls update with is_active: false', async () => {
    const builder = makeBuilder({ data: null, error: null })
    mockFrom.mockReturnValue(builder)

    await softDeleteLocation('test-uuid-123')

    expect(mockFrom).toHaveBeenCalledWith('locations')
    expect(builder.update).toHaveBeenCalledWith({ is_active: false })
    expect(builder.eq).toHaveBeenCalledWith('id', 'test-uuid-123')
  })

  it('throws when Supabase returns an error', async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: { message: 'Delete failed' } }))

    await expect(softDeleteLocation('bad-id')).rejects.toThrow('Delete failed')
  })
})
