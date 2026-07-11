/**
 * Tests for /results (ResultsPage)
 *
 * Fixtures are representative businesses/locations/offers under the new
 * businesses/offers/locations schema (not a literal mirror of seed.sql,
 * which is now randomly faker-generated rather than named fixtures).
 *
 * KNOWN GAPS (tests marked with a comment) document behaviour that the UI
 * does NOT yet implement — they will fail until the gap is closed. Each gap
 * is also summarised in the "UI Gaps" section at the bottom of this file.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import type { LocationWithOffers } from '@/schemas/zodSchema'

// ─── Next.js navigation mocks ────────────────────────────────────────────────

const mockPush = vi.fn()
const mockReplace = vi.fn()
const mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  usePathname: () => '/results',
}))

// ─── React-query mock ─────────────────────────────────────────────────────────

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>()
  return { ...actual, useQuery: vi.fn() }
})

import { useQuery } from '@tanstack/react-query'

// ─── LocationMap dynamic-import mock ─────────────────────────────────────────

vi.mock('@/components/LocationMap/LocationMap', () => ({
  default: ({ data }: { data: LocationWithOffers[] }) => (
    <div data-testid="location-map" data-count={data.length} />
  ),
}))

import { ResultsPage } from '@/app/results/ResultsPage'
import { useSearchFilters } from '@/stores/searchFilters.store'

// ─── Fixture builders ─────────────────────────────────────────────────────────

type Offer = LocationWithOffers['offers'][number]

function makeOffer(id: string, businessId: string, opts: Partial<Offer> = {}): Offer {
  return {
    id,
    business_id: businessId,
    name: 'Offer',
    description: null,
    price_type: ['free'],
    eligibility: ['anyone'],
    proof_required: false,
    proof_desc: null,
    expires_at: null,
    is_seasonal: false,
    season_start_date: null,
    season_end_date: null,
    is_active: true,
    verification_status: 'verified',
    notes: null,
    offer_hours: [],
    ...opts,
  }
}

type MakeLocationOpts = Partial<Omit<LocationWithOffers, 'business' | 'offers'>> & {
  business?: Partial<LocationWithOffers['business']>
  offers?: Offer[]
}

function makeLocation(
  locId: string,
  businessId: string,
  businessName: string,
  opts: MakeLocationOpts = {}
): LocationWithOffers {
  const { business: businessOverrides, offers, ...topOverrides } = opts
  return {
    id: locId,
    business_id: businessId,
    address: '100 SE Test Ave',
    address2: null,
    city: 'Portland',
    state: 'OR',
    zip_code: '97201',
    neighborhood: 'Test District',
    latitude: 45.523,
    longitude: -122.676,
    phone_number: '(503) 555-0000',
    food_formats: ['pickup'],
    verification_status: 'verified',
    notes: null,
    location_hours: [],
    ...topOverrides,
    business: {
      id: businessId,
      name: businessName,
      description: `Description for ${businessName}`,
      venue_type: 'food_pantry',
      verification_status: 'verified',
      is_active: true,
      notes: null,
      ...businessOverrides,
    },
    offers: offers ?? [makeOffer(`${businessId}-offer`, businessId)],
  }
}

// ── Hawthorne Pantry — free, two locations under the same business ───────────
const HAWTHORNE_BIZ = 'b0000000-0000-4000-8000-000000000001'
const hawthorne_loc1 = makeLocation('l0000000-0000-4000-8000-000000000001', HAWTHORNE_BIZ, 'Hawthorne Community Pantry', {
  address: '3425 SE Hawthorne Blvd',
  address2: 'Suite 101',
  neighborhood: 'Hawthorne',
  food_formats: ['pickup', 'grocery'],
  offers: [makeOffer('o0000000-0000-4000-8000-000000000001', HAWTHORNE_BIZ, { price_type: ['free'], eligibility: ['anyone'] })],
})
const hawthorne_loc2 = makeLocation('l0000000-0000-4000-8000-000000000002', HAWTHORNE_BIZ, 'Hawthorne Community Pantry', {
  address: '6710 SE Foster Rd',
  address2: null,
  phone_number: null,
  neighborhood: 'Woodstock',
  food_formats: ['pickup', 'grocery'],
  offers: [makeOffer('o0000000-0000-4000-8000-000000000002', HAWTHORNE_BIZ, { price_type: ['free'], eligibility: ['anyone'] })],
})

// ── Division Street Discount Grocer — discount, groceries ────────────────────
const GROCER_BIZ = 'b0000000-0000-4000-8000-000000000003'
const grocer_discount = makeLocation('l0000000-0000-4000-8000-000000000003', GROCER_BIZ, 'Division Street Discount Grocer', {
  address: '4233 SE Division St',
  neighborhood: 'Division',
  food_formats: ['grocery'],
  business: { venue_type: 'grocery_store', description: 'A worker-owned cooperative grocery store.' },
  offers: [makeOffer('o0000000-0000-4000-8000-000000000003', GROCER_BIZ, { price_type: ['discount'], eligibility: ['anyone'] })],
})

// ── Sellwood Kids Eat Free Diner — free, dine-in only, kids eligibility ──────
const DINER_BIZ = 'b0000000-0000-4000-8000-000000000004'
const diner_kids = makeLocation('l0000000-0000-4000-8000-000000000004', DINER_BIZ, 'Sellwood Kids Eat Free Diner', {
  address: '1132 SE Tacoma St',
  neighborhood: 'Sellwood',
  food_formats: ['dine_in'],
  business: { venue_type: 'restaurant', description: 'A diner where children under 12 eat free.' },
  offers: [makeOffer('o0000000-0000-4000-8000-000000000004', DINER_BIZ, { price_type: ['free'], eligibility: ['kids'] })],
})

// ── Kenton Community Services Hub — null lat/lon (cannot show map pin) ───────
const KENTON_BIZ = 'b0000000-0000-4000-8000-000000000005'
const kenton_hub = makeLocation('l0000000-0000-4000-8000-000000000005', KENTON_BIZ, 'Kenton Community Services Hub', {
  address: '2135 N Killingsworth St',
  neighborhood: 'Kenton',
  latitude: null as unknown as number,
  longitude: null as unknown as number,
  business: { venue_type: 'community_organization' },
  offers: [makeOffer('o0000000-0000-4000-8000-000000000005', KENTON_BIZ, { price_type: ['discount'], eligibility: ['anyone'] })],
})

// ── Pearl District Meal Depot — its only offer is inactive ───────────────────
const PEARL_BIZ = 'b0000000-0000-4000-8000-000000000006'
const pearl_inactive_offer = makeLocation('l0000000-0000-4000-8000-000000000006', PEARL_BIZ, 'Pearl District Meal Depot', {
  address: '535 NW 12th Ave',
  address2: 'Floor 1',
  neighborhood: 'Pearl District',
  offers: [makeOffer('o0000000-0000-4000-8000-000000000006', PEARL_BIZ, { is_active: false })],
})

// ── Concordia Summer Lunch Program — its only offer has expired ──────────────
const CONCORDIA_BIZ = 'b0000000-0000-4000-8000-000000000007'
const concordia_expired_offer = makeLocation('l0000000-0000-4000-8000-000000000007', CONCORDIA_BIZ, 'Concordia Summer Lunch Program', {
  address: '4828 NE 33rd Ave',
  neighborhood: 'Concordia',
  offers: [makeOffer('o0000000-0000-4000-8000-000000000007', CONCORDIA_BIZ, { expires_at: '2025-08-31' })],
})

// ── Columbia Gorge Veterans Market — delivery format, military eligibility ───
const VETERANS_BIZ = 'b0000000-0000-4000-8000-000000000008'
const veterans_delivery = makeLocation('l0000000-0000-4000-8000-000000000008', VETERANS_BIZ, 'Columbia Gorge Veterans Market', {
  address: '4821 NE Sandy Blvd',
  neighborhood: 'Hollywood',
  food_formats: ['delivery', 'grocery'],
  business: { venue_type: 'grocery_store' },
  offers: [makeOffer('o0000000-0000-4000-8000-000000000008', VETERANS_BIZ, { price_type: ['discount'], eligibility: ['military'] })],
})

// Representative dataset covering: multi-location business, free/discount
// price types, dine_in/pickup/delivery food formats, null lat/lon, an
// inactive offer, and an expired offer.
const ALL_LOCATIONS: LocationWithOffers[] = [
  hawthorne_loc1,
  hawthorne_loc2,   // same business, second location
  grocer_discount,
  diner_kids,
  kenton_hub,
  pearl_inactive_offer,  // its only offer is inactive -> should be filtered out
  concordia_expired_offer, // its only offer has expired -> should be filtered out
  veterans_delivery,
]

// ─── Helpers ────────────────────────────────────────────────────────────────

function mockLocations(items: LocationWithOffers[]) {
  vi.mocked(useQuery).mockReturnValue({
    data: items,
    isLoading: false,
  } as ReturnType<typeof useQuery>)
}

function setSearchParams(params: Record<string, string>) {
  ;[...mockSearchParams.keys()].forEach((k) => mockSearchParams.delete(k))
  Object.entries(params).forEach(([k, v]) => mockSearchParams.set(k, v))
}

// ─── Tests ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  ;[...mockSearchParams.keys()].forEach((k) => mockSearchParams.delete(k))
  mockLocations([])
  // The filters store is a module-level singleton — reset it so chip
  // clicks in one test don't leak into the next.
  useSearchFilters.getState().reset()
})

// ── Loading / empty state ─────────────────────────────────────────────────────

describe('empty / loading state', () => {
  it('shows loading text when the query returns no data', () => {
    mockLocations([])
    render(<ResultsPage />)
    expect(screen.getByText('Loading resources…')).toBeInTheDocument()
  })

  it('does not show loading text when results are present', () => {
    mockLocations([hawthorne_loc1])
    render(<ResultsPage />)
    expect(screen.queryByText('Loading resources…')).not.toBeInTheDocument()
  })
})

// ── Filter chips (chip UI / URL sync — independent of data shape) ────────────

describe('filter chips', () => {
  it('renders all 7 filter chips in the filter drawer', () => {
    render(<ResultsPage />)
    fireEvent.click(screen.getByRole('button', { name: /more/i }))
    const labels = ['Free', 'Discount', 'Prepared', 'Groceries', 'Restaurant', 'Pickup', 'Delivery']
    for (const label of labels) {
      expect(screen.getByRole('button', { name: new RegExp(`^${label}$`, 'i') })).toBeInTheDocument()
    }
  })

  it('the store defaults (Free, Prepared, Pickup, Anyone) are selected by default', () => {
    render(<ResultsPage />)
    for (const label of ['Free', 'Prepared', 'Pickup', 'Anyone']) {
      const chip = screen.getByRole('button', { name: new RegExp(`^${label}`, 'i') })
      expect(within(chip).queryByText('✕')).not.toHaveClass('opacity-0')
    }
    for (const label of ['Discount', 'Groceries', 'Restaurant']) {
      const chip = screen.queryByRole('button', { name: new RegExp(`^${label}`, 'i') })
      expect(chip).not.toBeInTheDocument()
    }
  })

  it('chip appears selected when its param is in the URL', () => {
    setSearchParams({ price: 'free' })
    render(<ResultsPage />)
    const freeChip = screen.getByRole('button', { name: /free/i })
    const closeIcon = within(freeChip).queryByText('✕')
    expect(closeIcon).not.toHaveClass('opacity-0')
  })

  it('clicking a chip adds its param to the URL', () => {
    render(<ResultsPage />)
    fireEvent.click(screen.getByRole('button', { name: /more/i }))
    fireEvent.click(screen.getByRole('button', { name: /^discount$/i }))
    const call = mockReplace.mock.calls[mockReplace.mock.calls.length - 1][0] as string
    const params = new URLSearchParams(call.split('?')[1])
    expect(params.get('price')?.split(',')).toEqual(expect.arrayContaining(['free', 'discount']))
  })

  it('clicking an active chip removes its param from the URL', () => {
    setSearchParams({ price: 'free' })
    render(<ResultsPage />)
    fireEvent.click(screen.getByRole('button', { name: /^free/i }))
    expect(mockReplace).toHaveBeenCalledWith('/results?', { scroll: false })
  })

  it('multiple chips with the same key accumulate comma-separated values', () => {
    render(<ResultsPage />)
    fireEvent.click(screen.getByRole('button', { name: /more/i }))
    fireEvent.click(screen.getByRole('button', { name: /^discount$/i }))
    const call = mockReplace.mock.calls[mockReplace.mock.calls.length - 1][0] as string
    const params = new URLSearchParams(call.split('?')[1])
    const priceValues = params.get('price')?.split(',') ?? []
    expect(priceValues).toContain('free')
    expect(priceValues).toContain('discount')
  })

  it('chips with different keys are stored under separate params', () => {
    render(<ResultsPage />)
    fireEvent.click(screen.getByRole('button', { name: /more/i }))
    fireEvent.click(screen.getByRole('button', { name: /^discount$/i }))
    fireEvent.click(screen.getByRole('button', { name: /^delivery$/i }))
    const lastCall = mockReplace.mock.calls[mockReplace.mock.calls.length - 1][0] as string
    const params = new URLSearchParams(lastCall.split('?')[1])
    expect(params.get('price')?.split(',')).toEqual(expect.arrayContaining(['free', 'discount']))
    expect(params.get('accessType')?.split(',')).toEqual(expect.arrayContaining(['pickup', 'delivery']))
  })
})

// ── List rendering ────────────────────────────────────────────────────────────

describe('list rendering', () => {
  it('renders a list item for each visible location in the dataset', () => {
    mockLocations(ALL_LOCATIONS)
    render(<ResultsPage />)
    // 6 items: 8 locations minus the inactive-offer and expired-offer ones
    const items = screen.getAllByRole('paragraph').filter((el) => el.classList.contains('font-medium'))
    expect(items).toHaveLength(ALL_LOCATIONS.length - 2)
  })

  it('renders each business name', () => {
    mockLocations([hawthorne_loc1, grocer_discount, diner_kids])
    render(<ResultsPage />)
    expect(screen.getByText('Hawthorne Community Pantry')).toBeInTheDocument()
    expect(screen.getByText('Division Street Discount Grocer')).toBeInTheDocument()
    expect(screen.getByText('Sellwood Kids Eat Free Diner')).toBeInTheDocument()
  })

  it('renders address without address2 when address2 is null', () => {
    mockLocations([hawthorne_loc2])
    render(<ResultsPage />)
    expect(screen.getByText('6710 SE Foster Rd')).toBeInTheDocument()
    expect(screen.queryByText(/null/i)).not.toBeInTheDocument()
  })

  it('renders address with address2 when both are present', () => {
    mockLocations([hawthorne_loc1])
    render(<ResultsPage />)
    expect(screen.getByText('3425 SE Hawthorne Blvd, Suite 101')).toBeInTheDocument()
  })

  it('renders description when present', () => {
    mockLocations([diner_kids])
    render(<ResultsPage />)
    expect(screen.getByText(/children under 12 eat free/i)).toBeInTheDocument()
  })

  it('does not render a description element when description is null', () => {
    const noDesc = makeLocation('l0000000-0000-4000-8000-0000000000ff', HAWTHORNE_BIZ, 'No Description Business', {
      business: { description: null },
    })
    mockLocations([noDesc])
    render(<ResultsPage />)
    const nameEl = screen.getByText('No Description Business')
    const container = nameEl.closest('[class*="px-4"]')!
    const paragraphs = container.querySelectorAll('p')
    expect(paragraphs).toHaveLength(2) // name + address only
  })

  it('passes data to the LocationMap component', () => {
    mockLocations([hawthorne_loc1, grocer_discount])
    render(<ResultsPage />)
    const mapEl = screen.getByTestId('location-map')
    expect(mapEl.getAttribute('data-count')).toBe('2')
  })
})

// ── Edge cases ─────────────────────────────────────────────────────────────────

describe('edge cases', () => {
  it('renders both locations for a business that has two of them', () => {
    mockLocations([hawthorne_loc1, hawthorne_loc2])
    render(<ResultsPage />)
    expect(screen.getByText('3425 SE Hawthorne Blvd, Suite 101')).toBeInTheDocument()
    expect(screen.getByText('6710 SE Foster Rd')).toBeInTheDocument()
  })

  it('handles a location with no phone number without crashing', () => {
    mockLocations([hawthorne_loc2])
    expect(() => render(<ResultsPage />)).not.toThrow()
  })

  it('handles a location with null lat/lon (cannot show map pin) without crashing', () => {
    mockLocations([kenton_hub])
    expect(() => render(<ResultsPage />)).not.toThrow()
    expect(screen.getByText('Kenton Community Services Hub')).toBeInTheDocument()
  })

  it('renders a location whose offer has multiple eligibility values', () => {
    const multiEligibility = makeLocation('l0000000-0000-4000-8000-000000000009', GROCER_BIZ, 'Multi-Eligibility Market', {
      offers: [makeOffer('o0000000-0000-4000-8000-000000000009', GROCER_BIZ, { eligibility: ['senior', 'military'] })],
    })
    mockLocations([multiEligibility])
    expect(() => render(<ResultsPage />)).not.toThrow()
    expect(screen.getByText('Multi-Eligibility Market')).toBeInTheDocument()
  })

  // FIXED (was a documented gap under the old resources/physical_locations
  // model): offer-level is_active is now checked by isVisible().
  it('does not show a location whose only offer is inactive', () => {
    mockLocations(ALL_LOCATIONS)
    render(<ResultsPage />)
    expect(screen.queryByText('Pearl District Meal Depot')).not.toBeInTheDocument()
  })

  // FIXED (was a documented gap): offer-level expires_at is now checked by
  // isVisible().
  it('does not show a location whose only offer has expired', () => {
    mockLocations(ALL_LOCATIONS)
    render(<ResultsPage />)
    expect(screen.queryByText('Concordia Summer Lunch Program')).not.toBeInTheDocument()
  })
})

// ── Filter chip → result filtering ───────────────────────────────────────────
//
// price and accessType are now wired to real offer/location fields
// (offer.price_type, location.food_formats) and filter the result set.
// foodType and eligibility chips exist in the UI/URL but still have no
// mapping onto anything in the new schema either, so they remain
// documented gaps, same as before this refactor.

describe('filter chip → result filtering', () => {
  it('price=free shows only locations with a free offer', () => {
    setSearchParams({ price: 'free' })
    mockLocations(ALL_LOCATIONS)
    render(<ResultsPage />)
    expect(screen.getAllByText('Hawthorne Community Pantry').length).toBeGreaterThan(0)
    expect(screen.getByText('Sellwood Kids Eat Free Diner')).toBeInTheDocument()
    expect(screen.queryByText('Division Street Discount Grocer')).not.toBeInTheDocument()
    expect(screen.queryByText('Columbia Gorge Veterans Market')).not.toBeInTheDocument()
  })

  it('price=discount shows only locations with a discount offer', () => {
    setSearchParams({ price: 'discount' })
    mockLocations(ALL_LOCATIONS)
    render(<ResultsPage />)
    expect(screen.getByText('Division Street Discount Grocer')).toBeInTheDocument()
    expect(screen.getByText('Columbia Gorge Veterans Market')).toBeInTheDocument()
    expect(screen.queryByText('Hawthorne Community Pantry')).not.toBeInTheDocument()
  })

  it('price=free,discount (OR) shows both free and discounted locations', () => {
    setSearchParams({ price: 'free,discount' })
    mockLocations(ALL_LOCATIONS)
    render(<ResultsPage />)
    expect(screen.getAllByText('Hawthorne Community Pantry').length).toBeGreaterThan(0)
    expect(screen.getByText('Division Street Discount Grocer')).toBeInTheDocument()
  })

  it('accessType=pickup shows locations that support pickup', () => {
    setSearchParams({ accessType: 'pickup' })
    mockLocations(ALL_LOCATIONS)
    render(<ResultsPage />)
    expect(screen.getAllByText('Hawthorne Community Pantry').length).toBeGreaterThan(0)
    expect(screen.queryByText('Sellwood Kids Eat Free Diner')).not.toBeInTheDocument() // dine_in only
  })

  it('accessType=delivery shows only locations that support delivery', () => {
    setSearchParams({ accessType: 'delivery' })
    mockLocations(ALL_LOCATIONS)
    render(<ResultsPage />)
    expect(screen.getByText('Columbia Gorge Veterans Market')).toBeInTheDocument()
    expect(screen.queryByText('Hawthorne Community Pantry')).not.toBeInTheDocument()
  })

  it('cross-key filter (price=free AND accessType=pickup) narrows results', () => {
    setSearchParams({ price: 'free', accessType: 'pickup' })
    mockLocations(ALL_LOCATIONS)
    render(<ResultsPage />)
    expect(screen.getAllByText('Hawthorne Community Pantry').length).toBeGreaterThan(0)
    // Diner is free but dine_in only, not pickup
    expect(screen.queryByText('Sellwood Kids Eat Free Diner')).not.toBeInTheDocument()
  })

  // GAP: foodType chip values (prepared/groceries/restaurant) have no
  // mapping onto venue_type or anything else in the new schema, same as
  // under the old benefit_category model. Selecting a foodType chip has no
  // effect on the result set.
  it('foodType filter is not applied to results (documented gap)', () => {
    setSearchParams({ foodType: 'restaurant' })
    mockLocations(ALL_LOCATIONS)
    render(<ResultsPage />)
    // GAP: a pantry (not a restaurant) still shows up
    expect(screen.getAllByText('Hawthorne Community Pantry').length).toBeGreaterThan(0)
  })
})

// ── View toggle (List / Map) ───────────────────────────────────────────────────

describe('List / Map view toggle', () => {
  it('shows "List" and "Map" tab buttons', () => {
    render(<ResultsPage />)
    expect(screen.getByRole('tab', { name: /list/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /^map$/i })).toBeInTheDocument()
  })

  it('renders the location map element', () => {
    render(<ResultsPage />)
    expect(screen.getByTestId('location-map')).toBeInTheDocument()
  })
})

// ─── UI GAPS SUMMARY ──────────────────────────────────────────────────────────
//
// 1. FOODTYPE / ELIGIBILITY FILTERING NOT IMPLEMENTED
//    price and accessType are wired to offer.price_type / location.food_formats.
//    foodType (prepared/groceries/restaurant) and eligibility (anyone/...)
//    chips still have no mapping onto the schema and are not applied.
//
// 2. OFFERS WITH NO LINKED LOCATIONS ARE INVISIBLE
//    A verified/active offer with zero offer_locations rows is never
//    returned (the read path is rooted at locations), matching the
//    migration's "no rows = no availability" design. There is currently no
//    UI path for such an offer.
//
// FIXED by the businesses/offers/locations refactor (previously documented
// gaps under the old resources/physical_locations model):
//  - Inactive offers no longer leak into results (isVisible checks
//    offer.is_active per offer, not a single resource-level flag).
//  - Expired offers no longer leak into results (isVisible checks
//    offer.expires_at per offer).
//  - Multi-location businesses no longer produce duplicate React keys —
//    each location has its own unique id now, unlike the old model where
//    every location under one resource shared the same top-level id.
//  - price/accessType filter chips are now wired to real fields.
