import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCookiesGet = vi.hoisted(() => vi.fn())
const mockCookiesSet = vi.hoisted(() => vi.fn())
const mockCookiesDelete = vi.hoisted(() => vi.fn())
const mockGetUser = vi.hoisted(() => vi.fn())
const mockSignInWithPassword = vi.hoisted(() => vi.fn())
const mockFrom = vi.hoisted(() => vi.fn())
const mockRedirect = vi.hoisted(() => vi.fn())

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: mockCookiesGet,
    set: mockCookiesSet,
    delete: mockCookiesDelete,
  }),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser, signInWithPassword: mockSignInWithPassword },
    from: mockFrom,
  })),
}))

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}))

import {
  signIn,
  signOut,
  getOffers,
  getOfferWithLocations,
  updateOffer,
  searchBusinesses,
  getBusinessDetail,
  submitOfferEntry,
} from '@/app/admin/upload/actions'

const ADMIN_USER = {
  id: 'admin-1',
  email: 'admin@example.com',
  app_metadata: { role: 'admin' },
}

function mockAdminSession() {
  mockCookiesGet.mockReturnValue({ value: 'admin-token' })
  mockGetUser.mockResolvedValue({ data: { user: ADMIN_USER }, error: null })
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── signIn ──────────────────────────────────────────────────────────────────

describe('signIn', () => {
  it('returns an error when email is missing', async () => {
    const formData = new FormData()
    formData.set('password', 'pass')
    const result = await signIn({}, formData)
    expect(result.error).toMatch(/required/i)
  })

  it('returns an error when password is missing', async () => {
    const formData = new FormData()
    formData.set('email', 'user@example.com')
    const result = await signIn({}, formData)
    expect(result.error).toMatch(/required/i)
  })

  it('returns an error when supabase auth fails', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { session: null, user: null },
      error: { message: 'Invalid login credentials' },
    })
    const formData = new FormData()
    formData.set('email', 'user@example.com')
    formData.set('password', 'wrong')
    const result = await signIn({}, formData)
    expect(result.error).toMatch(/invalid email or password/i)
  })

  it('returns an error when user does not have admin role', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: {
        session: { access_token: 'tok', expires_in: 3600 },
        user: { id: '1', app_metadata: { role: 'user' } },
      },
      error: null,
    })
    const formData = new FormData()
    formData.set('email', 'user@example.com')
    formData.set('password', 'pass')
    const result = await signIn({}, formData)
    expect(result.error).toMatch(/admin role required/i)
  })

  it('sets the auth cookie and redirects on successful admin sign in', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: {
        session: { access_token: 'my-token', expires_in: 3600 },
        user: { id: 'admin-1', app_metadata: { role: 'admin' } },
      },
      error: null,
    })
    const formData = new FormData()
    formData.set('email', 'admin@example.com')
    formData.set('password', 'adminpass')
    await signIn({}, formData)
    expect(mockCookiesSet).toHaveBeenCalledWith(
      'auth_token',
      'my-token',
      expect.objectContaining({ httpOnly: true }),
    )
    expect(mockRedirect).toHaveBeenCalledWith('/admin/upload')
  })
})

// ─── signOut ─────────────────────────────────────────────────────────────────

describe('signOut', () => {
  it('deletes the auth cookie', async () => {
    await signOut()
    expect(mockCookiesDelete).toHaveBeenCalledWith('auth_token')
  })

  it('redirects to /admin/upload', async () => {
    await signOut()
    expect(mockRedirect).toHaveBeenCalledWith('/admin/upload')
  })
})

// ─── getOffers ───────────────────────────────────────────────────────────────

describe('getOffers', () => {
  it('returns an empty array when not authenticated', async () => {
    mockCookiesGet.mockReturnValue(undefined)
    const result = await getOffers()
    expect(result).toEqual([])
  })

  it('returns businesses when authenticated as admin', async () => {
    mockAdminSession()
    const businessRows = [{ id: '1', name: 'Food Bank' }]
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: businessRows, error: null }),
      }),
    })
    const result = await getOffers()
    expect(result).toEqual(businessRows)
    expect(mockFrom).toHaveBeenCalledWith('businesses')
  })

  it('returns an empty array when the db query fails', async () => {
    mockAdminSession()
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'db error' } }),
      }),
    })
    const result = await getOffers()
    expect(result).toEqual([])
  })
})

// ─── getOfferWithLocations ────────────────────────────────────────────────────

describe('getOfferWithLocations', () => {
  it('returns null when not authenticated', async () => {
    mockCookiesGet.mockReturnValue(undefined)
    const result = await getOfferWithLocations('business-1')
    expect(result).toBeNull()
  })

  it('returns null when the business is not found', async () => {
    mockAdminSession()
    mockFrom.mockImplementation((table: string) => {
      if (table === 'businesses') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
            }),
          }),
        }
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }
    })
    const result = await getOfferWithLocations('bad-id')
    expect(result).toBeNull()
  })

  it('returns null when the business has no offer yet', async () => {
    mockAdminSession()
    mockFrom.mockImplementation((table: string) => {
      if (table === 'businesses') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'business-1', name: 'Food Bank', description: null, venue_type: 'food_bank', verification_status: 'pending', notes: null },
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'offers') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        }
      }
      return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: [], error: null }) }) }
    })
    const result = await getOfferWithLocations('business-1')
    expect(result).toBeNull()
  })

  it('returns the business with its primary offer and locations when found', async () => {
    mockAdminSession()
    const businessData = {
      id: 'business-1',
      name: 'Food Bank',
      description: 'A food bank',
      venue_type: 'food_bank',
      verification_status: 'pending',
      notes: null,
    }
    const offerData = [{
      id: 'offer-1',
      business_id: 'business-1',
      description: null,
      price_type: ['free'],
      eligibility: ['anyone'],
      expires_at: null,
      is_active: true,
    }]
    const locationData = [{ id: 'loc-1', address: '123 Main St', hours: [] }]

    mockFrom.mockImplementation((table: string) => {
      if (table === 'businesses') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: businessData, error: null }),
            }),
          }),
        }
      }
      if (table === 'offers') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: offerData, error: null }),
            }),
          }),
        }
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: locationData, error: null }),
        }),
      }
    })

    const result = await getOfferWithLocations('business-1')
    expect(result).not.toBeNull()
    expect(result!.name).toBe('Food Bank')
    expect(result!.offer_id).toBe('offer-1')
    expect(result!.price_type).toEqual(['free'])
    expect(result!.locations).toEqual(locationData)
  })
})

// ─── updateOffer ─────────────────────────────────────────────────────────────

describe('updateOffer', () => {
  it('returns an error when not authenticated', async () => {
    mockCookiesGet.mockReturnValue(undefined)
    const result = await updateOffer('business-1', 'offer-1', { name: 'New Name' })
    expect(result.error).toMatch(/unauthorized/i)
  })

  it('returns success when both the business and offer updates succeed', async () => {
    mockAdminSession()
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    })
    const result = await updateOffer('business-1', 'offer-1', { name: 'New Name' })
    expect(result.success).toBe(true)
    expect(mockFrom).toHaveBeenCalledWith('businesses')
    expect(mockFrom).toHaveBeenCalledWith('offers')
  })

  it('returns an error when the business update fails', async () => {
    mockAdminSession()
    mockFrom.mockImplementation((table: string) => ({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue(
          table === 'businesses' ? { error: { message: 'business update failed' } } : { error: null }
        ),
      }),
    }))
    const result = await updateOffer('business-1', 'offer-1', { name: 'New Name' })
    expect(result.error).toBe('business update failed')
  })

  it('returns an error when the offer update fails', async () => {
    mockAdminSession()
    mockFrom.mockImplementation((table: string) => ({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue(
          table === 'offers' ? { error: { message: 'offer update failed' } } : { error: null }
        ),
      }),
    }))
    const result = await updateOffer('business-1', 'offer-1', { name: 'New Name' })
    expect(result.error).toBe('offer update failed')
  })
})

// ─── searchBusinesses ─────────────────────────────────────────────────────────

describe('searchBusinesses', () => {
  it('returns an empty array when not authenticated', async () => {
    mockCookiesGet.mockReturnValue(undefined)
    const result = await searchBusinesses('food')
    expect(result).toEqual([])
  })

  it('returns an empty array for a blank query without hitting the db', async () => {
    mockAdminSession()
    const result = await searchBusinesses('   ')
    expect(result).toEqual([])
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('returns matching businesses', async () => {
    mockAdminSession()
    const rows = [{ id: 'biz-1', name: 'Oregon Food Bank' }]
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        ilike: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: rows, error: null }),
          }),
        }),
      }),
    })
    const result = await searchBusinesses('oregon')
    expect(result).toEqual(rows)
  })
})

// ─── getBusinessDetail ────────────────────────────────────────────────────────

describe('getBusinessDetail', () => {
  it('returns null when not authenticated', async () => {
    mockCookiesGet.mockReturnValue(undefined)
    const result = await getBusinessDetail('biz-1')
    expect(result).toBeNull()
  })

  it('returns the business locations and offers', async () => {
    mockAdminSession()
    const locations = [
      { id: 'loc-1', address: '123 Main St', address2: null, city: 'Portland', state: 'OR', zip_code: '97201' },
    ]
    const offers = [{ id: 'offer-1', name: 'Free Lunch' }]
    mockFrom.mockImplementation((table: string) => {
      if (table === 'locations') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: locations, error: null }),
            }),
          }),
        }
      }
      if (table === 'offers') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: offers, error: null }),
            }),
          }),
        }
      }
      throw new Error(`unexpected table ${table}`)
    })
    const result = await getBusinessDetail('biz-1')
    expect(result).toEqual({ locations, offers })
  })
})

// ─── submitOfferEntry ─────────────────────────────────────────────────────────

describe('submitOfferEntry', () => {
  const NEW_BUSINESS = { mode: 'new' as const, name: 'Food Bank', venue_type: 'food_bank' }
  const NEW_OFFER = { mode: 'new' as const, name: 'Free Groceries', price_type: ['free'], eligibility: ['anyone'] }
  const NONE_LOCATION = { mode: 'none' as const }

  // Builds a chainable mock for the "does this already exist" lookups
  // (select().ilike()...maybeSingle()), defaulting to "not found".
  function makeExistsCheck(result: { data: unknown; error: unknown } = { data: null, error: null }) {
    const chain: Record<string, unknown> = {}
    const link = () => chain
    chain.select = vi.fn(link)
    chain.ilike = vi.fn(link)
    chain.is = vi.fn(link)
    chain.eq = vi.fn(link)
    chain.maybeSingle = vi.fn(() => Promise.resolve(result))
    return chain
  }

  it('returns an error when not authenticated', async () => {
    mockCookiesGet.mockReturnValue(undefined)
    const result = await submitOfferEntry(
      { business: NEW_BUSINESS, location: NONE_LOCATION, offer: NEW_OFFER },
      'admin-1',
    )
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toMatch(/unauthorized/i)
  })

  it('rejects an existing offer with no location', async () => {
    mockAdminSession()
    const result = await submitOfferEntry(
      {
        business: { mode: 'existing', id: 'biz-1' },
        location: NONE_LOCATION,
        offer: { mode: 'existing', id: 'offer-1' },
      },
      'admin-1',
    )
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toMatch(/can only be attached to a location/i)
  })

  it('rejects an existing location for a business that has not been created yet', async () => {
    mockAdminSession()
    const result = await submitOfferEntry(
      { business: NEW_BUSINESS, location: { mode: 'existing', id: 'loc-1' }, offer: NEW_OFFER },
      'admin-1',
    )
    expect(result.success).toBe(false)
  })

  it('rejects a name conflict when creating a new business', async () => {
    mockAdminSession()
    mockFrom.mockImplementation((table: string) => {
      if (table === 'businesses') {
        return makeExistsCheck({ data: { id: 'existing-biz', name: 'Food Bank' }, error: null })
      }
      throw new Error(`unexpected table ${table}`)
    })
    const result = await submitOfferEntry(
      { business: NEW_BUSINESS, location: NONE_LOCATION, offer: NEW_OFFER },
      'admin-1',
    )
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toMatch(/already exists/i)
  })

  it('reuses an existing business and creates a new offer with no location', async () => {
    mockAdminSession()
    const mockOfferInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: 'offer-1' }, error: null }),
      }),
    })
    mockFrom.mockImplementation((table: string) => {
      if (table === 'offers') return { insert: mockOfferInsert }
      throw new Error(`unexpected table ${table}`)
    })
    const result = await submitOfferEntry(
      { business: { mode: 'existing', id: 'biz-1' }, location: NONE_LOCATION, offer: NEW_OFFER },
      'admin-1',
    )
    expect(result).toEqual({ success: true, businessId: 'biz-1', locationId: null, offerId: 'offer-1' })
    expect(mockOfferInsert).toHaveBeenCalledWith(expect.objectContaining({ business_id: 'biz-1' }))
  })

  it('rejects a conflicting address when creating a new location, naming the existing business', async () => {
    mockAdminSession()
    mockFrom.mockImplementation((table: string) => {
      if (table === 'locations') {
        return makeExistsCheck({
          data: { id: 'loc-1', business_id: 'other-biz', businesses: { name: 'Other Business' } },
          error: null,
        })
      }
      throw new Error(`unexpected table ${table}`)
    })
    const result = await submitOfferEntry(
      {
        business: { mode: 'existing', id: 'biz-1' },
        location: { mode: 'new', address: '123 Main St', city: 'Portland', state: 'OR', zip_code: '97201' },
        offer: NEW_OFFER,
      },
      'admin-1',
    )
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toMatch(/Other Business/)
  })

  it('creates a new location with geocoded coordinates and links it to the offer', async () => {
    mockAdminSession()
    process.env.GEOCODIO_API_KEY = 'test-key'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        results: [{ location: { lat: 45.5, lng: -122.6 }, accuracy: 1, accuracy_type: 'rooftop' }],
      }),
    }))

    const mockOfferInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: 'offer-1' }, error: null }) }),
    })
    const mockLocationInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: 'loc-1' }, error: null }) }),
    })
    const mockLinkInsert = vi.fn().mockResolvedValue({ error: null })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'locations') return { ...makeExistsCheck(), insert: mockLocationInsert }
      if (table === 'offers') return { insert: mockOfferInsert }
      if (table === 'offer_locations') return { insert: mockLinkInsert }
      throw new Error(`unexpected table ${table}`)
    })

    const result = await submitOfferEntry(
      {
        business: { mode: 'existing', id: 'biz-1' },
        location: { mode: 'new', address: '123 Main St', city: 'Portland', state: 'OR', zip_code: '97201' },
        offer: NEW_OFFER,
      },
      'admin-1',
    )

    expect(result).toEqual({ success: true, businessId: 'biz-1', locationId: 'loc-1', offerId: 'offer-1' })
    expect(mockLocationInsert).toHaveBeenCalledWith(
      expect.objectContaining({ business_id: 'biz-1', latitude: 45.5, longitude: -122.6 }),
    )
    expect(mockLinkInsert).toHaveBeenCalledWith({ offer_id: 'offer-1', location_id: 'loc-1' })

    vi.unstubAllGlobals()
    delete process.env.GEOCODIO_API_KEY
  })

  it('reports a friendly message when the offer is already attached to the location', async () => {
    mockAdminSession()
    const mockLinkInsert = vi.fn().mockResolvedValue({ error: { message: 'duplicate key', code: '23505' } })
    mockFrom.mockImplementation((table: string) => {
      if (table === 'offer_locations') return { insert: mockLinkInsert }
      throw new Error(`unexpected table ${table}`)
    })
    const result = await submitOfferEntry(
      {
        business: { mode: 'existing', id: 'biz-1' },
        location: { mode: 'existing', id: 'loc-1' },
        offer: { mode: 'existing', id: 'offer-1' },
      },
      'admin-1',
    )
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toMatch(/already attached/i)
  })

  it('folds offer_source into the new offer notes', async () => {
    mockAdminSession()
    const mockOfferInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: 'offer-1' }, error: null }) }),
    })
    mockFrom.mockImplementation((table: string) => {
      if (table === 'offers') return { insert: mockOfferInsert }
      throw new Error(`unexpected table ${table}`)
    })
    await submitOfferEntry(
      {
        business: { mode: 'existing', id: 'biz-1' },
        location: NONE_LOCATION,
        offer: { ...NEW_OFFER, offer_source: 'https://example.com' },
      },
      'admin-1',
    )
    expect(mockOfferInsert).toHaveBeenCalledWith(expect.objectContaining({ notes: 'Source: https://example.com' }))
  })
})
