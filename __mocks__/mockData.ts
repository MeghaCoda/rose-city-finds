import type { LocationWithOffersRow } from "@/app/api/locations/db";
import type { LocationWithOffers, LocationWithHours } from "@/schemas/zodSchema";

export const MOCK_LOCATION_ID = '11111111-1111-1111-8111-111111111111';
export const MOCK_BUSINESS_ID = '44444444-4444-4444-8444-444444444444';
export const MOCK_OFFER_ID = '55555555-5555-5555-8555-555555555555';
export const MOCK_LOCATION_HOURS_ID = '66666666-6666-6666-8666-666666666666';
export const MOCK_OFFER_HOURS_ID = '77777777-7777-7777-8777-777777777777';

// ── New schema (businesses/offers/locations) ────────────────────────────────

const mockBusinessRow = {
  id: MOCK_BUSINESS_ID,
  name: 'Mock Business',
  description: null,
  venue_type: 'food_pantry' as const,
  verification_status: 'verified' as const,
  verification_status_changed_at: null,
  verification_expires_at: null,
  is_active: true,
  created_by: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  notes: null,
};

const mockOfferRow = {
  id: MOCK_OFFER_ID,
  business_id: MOCK_BUSINESS_ID,
  name: 'Mock Offer',
  description: null,
  price_type: ['free'] as ('free' | 'discount')[],
  eligibility: ['anyone'] as ('anyone' | 'student' | 'senior' | 'kids' | 'military' | 'snap' | 'income_requirement' | 'other')[],
  proof_required: false,
  proof_desc: null,
  expires_at: null,
  is_seasonal: false,
  season_start_date: null,
  season_end_date: null,
  is_active: true,
  verification_status: 'verified' as const,
  verification_status_changed_at: null,
  verification_expires_at: null,
  created_by: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  notes: null,
  hours_notes: null,
  offer_hours: [
    {
      id: MOCK_OFFER_HOURS_ID,
      offer_id: MOCK_OFFER_ID,
      day: 'monday' as const,
      opens_at: '08:00:00',
      closes_at: '17:00:00',
      valid_from: null,
      valid_until: null,
    },
  ],
};

// Raw row shape as returned by fetchLocationsWithOffers — used by db.test.ts.
export const mockLocationWithOffersRow: LocationWithOffersRow = {
  id: MOCK_LOCATION_ID,
  business_id: MOCK_BUSINESS_ID,
  address: '123 Main St',
  address2: null,
  city: 'Portland',
  state: 'OR',
  zip_code: '97201',
  neighborhood: null,
  latitude: 45.523,
  longitude: -122.6765,
  phone_number: '503-555-1234',
  food_formats: ['pickup'],
  verification_status: 'verified',
  verification_status_changed_at: null,
  created_by: null,
  created_at: '2025-01-01T00:00:00Z',
  notes: null,
  hours_notes: null,
  business: mockBusinessRow,
  location_hours: [
    {
      id: MOCK_LOCATION_HOURS_ID,
      location_id: MOCK_LOCATION_ID,
      day: 'monday',
      opens_at: '08:00:00',
      closes_at: '17:00:00',
      valid_from: null,
      valid_until: null,
    },
  ],
  offer_locations: [{ offers: mockOfferRow }],
};

// DTO shape returned by the service — used by route/component tests.
export const mockLocationWithOffers: LocationWithOffers = {
  id: MOCK_LOCATION_ID,
  business_id: MOCK_BUSINESS_ID,
  address: '123 Main St',
  address2: null,
  city: 'Portland',
  state: 'OR',
  zip_code: '97201',
  neighborhood: null,
  latitude: 45.523,
  longitude: -122.6765,
  phone_number: '503-555-1234',
  food_formats: ['pickup'],
  verification_status: 'verified',
  notes: null,
  hours_notes: null,
  business: {
    id: MOCK_BUSINESS_ID,
    name: 'Mock Business',
    description: null,
    venue_type: 'food_pantry',
    verification_status: 'verified',
    is_active: true,
    notes: null,
  },
  location_hours: [
    {
      day: 'monday',
      opens_at: '08:00:00',
      closes_at: '17:00:00',
      valid_from: null,
      valid_until: null,
    },
  ],
  offers: [
    {
      id: MOCK_OFFER_ID,
      business_id: MOCK_BUSINESS_ID,
      name: 'Mock Offer',
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
      hours_notes: null,
      offer_hours: [
        {
          day: 'monday',
          opens_at: '08:00:00',
          closes_at: '17:00:00',
          valid_from: null,
          valid_until: null,
        },
      ],
    },
  ],
};

// Write-path response shape (POST/PUT /api/locations) — a location and its
// own hours, no business/offers nesting since creating/editing a location
// doesn't touch either.
export const mockLocationWithHours: LocationWithHours = {
  id: MOCK_LOCATION_ID,
  business_id: MOCK_BUSINESS_ID,
  address: '123 Main St',
  address2: null,
  city: 'Portland',
  state: 'OR',
  zip_code: '97201',
  neighborhood: null,
  latitude: 45.523,
  longitude: -122.6765,
  phone_number: '503-555-1234',
  food_formats: ['pickup'],
  verification_status: 'verified',
  notes: null,
  hours_notes: null,
  location_hours: [
    {
      day: 'monday',
      opens_at: '08:00:00',
      closes_at: '17:00:00',
      valid_from: null,
      valid_until: null,
    },
  ],
};
