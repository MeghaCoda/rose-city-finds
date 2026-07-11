'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_VENUE_TYPE } from './uploadConstants';

function makeAuthClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
}

function makeUserClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  );
}

async function verifyAdminToken(token: string) {
  const auth = makeAuthClient();
  const { data: { user }, error } = await auth.auth.getUser(token);
  if (error || !user) return null;

  if (user.app_metadata?.role !== 'admin') return null;

  return user;
}

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  const user = await verifyAdminToken(token);
  if (!user) return null;
  return { user, token };
}

export type SignInState = { error?: string };

export async function signIn(_: SignInState, formData: FormData): Promise<SignInState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const auth = makeAuthClient();
  const { data, error } = await auth.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return { error: 'Invalid email or password.' };
  }

  if (data.user.app_metadata?.role !== 'admin') {
    return { error: 'Access denied. Admin role required.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('auth_token', data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: data.session.expires_in,
    path: '/',
  });

  redirect('/admin/upload');
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  redirect('/admin/upload');
}

// ============================================================
// Offers (businesses + their primary offer)
//
// This admin flow always creates one business with exactly one offer at a
// time (see uploadOffers below), so "an offer" here means that
// business+offer bundle -- selected/edited by the business's id and name,
// matching how the UI already talks about "offers" as the thing being
// managed. A business ending up with more than one offer (e.g. from manual
// DB changes) isn't handled by this panel; it edits offers[0].
// ============================================================

export type OfferSummary = { id: string; name: string };

export async function getOffers(): Promise<OfferSummary[]> {
  const session = await requireAdmin();
  if (!session) return [];
  const db = makeUserClient(session.token);
  const { data, error } = await db.from('businesses').select('id, name').order('name');
  if (error || !data) return [];
  return data as OfferSummary[];
}

export type LocationHour = {
  id: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  opens_at: string;
  closes_at: string;
  notes: string | null;
  valid_from: string | null;
  valid_until: string | null;
};

export type OfferLocation = {
  id: string;
  address: string;
  address2: string | null;
  city: string;
  state: string;
  zip_code: string;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  phone_number: string | null;
  notes: string | null;
  verification_status: string | null;
  hours: LocationHour[];
};

export type OfferDetail = {
  id: string; // business id
  offer_id: string; // this business's primary offer id
  name: string;
  description: string | null;
  venue_type: string;
  offer_desc: string | null;
  price_type: string[];
  eligibility: string[];
  verification_status: string | null;
  expires_at: string | null;
  is_active: boolean | null;
  notes: string | null;
  locations: OfferLocation[];
};

export async function getOfferWithLocations(id: string): Promise<OfferDetail | null> {
  const session = await requireAdmin();
  if (!session) return null;
  const db = makeUserClient(session.token);
  const [businessRes, offersRes, locRes] = await Promise.all([
    db.from('businesses').select('*').eq('id', id).single(),
    db.from('offers').select('*').eq('business_id', id).order('created_at', { ascending: true }),
    db.from('locations').select('*').eq('business_id', id),
  ]);
  if (businessRes.error || !businessRes.data) return null;
  const b = businessRes.data;
  const offer = (offersRes.data ?? [])[0] ?? null;
  if (!offer) return null;

  return {
    id: b.id,
    offer_id: offer.id,
    name: b.name,
    description: b.description ?? null,
    venue_type: b.venue_type,
    offer_desc: offer.description ?? null,
    price_type: offer.price_type ?? [],
    eligibility: offer.eligibility ?? [],
    verification_status: b.verification_status ?? null,
    expires_at: offer.expires_at ?? null,
    is_active: offer.is_active ?? null,
    notes: b.notes ?? null,
    locations: (locRes.data ?? []).map((l: Omit<OfferLocation, 'hours'>) => ({ ...l, hours: [] })),
  };
}

export type UpdateOfferResult = { success?: true; error?: string };

export async function updateOffer(
  businessId: string,
  offerId: string,
  data: {
    name?: string;
    description?: string | null;
    venue_type?: string;
    offer_desc?: string | null;
    price_type?: string[] | null;
    eligibility?: string[] | null;
    expires_at?: string | null;
    is_active?: boolean | null;
    verification_status?: string | null;
    notes?: string | null;
  }
): Promise<UpdateOfferResult> {
  const session = await requireAdmin();
  if (!session) return { error: 'Unauthorized. Please sign in as admin.' };
  const db = makeUserClient(session.token);

  const { error: businessError } = await db
    .from('businesses')
    .update({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.venue_type !== undefined && { venue_type: data.venue_type }),
      ...(data.verification_status !== undefined && { verification_status: data.verification_status }),
      ...(data.notes !== undefined && { notes: data.notes }),
    })
    .eq('id', businessId);
  if (businessError) return { error: businessError.message };

  const { error: offerError } = await db
    .from('offers')
    .update({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.offer_desc !== undefined && { description: data.offer_desc }),
      ...(data.price_type !== undefined && { price_type: data.price_type ?? [] }),
      ...(data.eligibility !== undefined && { eligibility: data.eligibility ?? [] }),
      ...(data.expires_at !== undefined && { expires_at: data.expires_at }),
      ...(data.is_active !== undefined && { is_active: data.is_active }),
      ...(data.verification_status !== undefined && { verification_status: data.verification_status }),
    })
    .eq('id', offerId);
  if (offerError) return { error: offerError.message };

  return { success: true };
}

// ============================================================
// Approval queue
// ============================================================

export type PendingResource = {
  id: string; // business id
  offer_id: string;
  name: string;
  description: string | null;
  offer_desc: string | null;
  price_type: string[];
  eligibility: string[];
  expires_at: string | null;
  is_active: boolean | null;
  notes: string | null;
  verification_status: string;
  created_at: string | null;
  locations: OfferLocation[];
};

export async function getPendingResources(): Promise<PendingResource[]> {
  const session = await requireAdmin();
  if (!session) return [];
  const db = makeUserClient(session.token);

  const { data: businesses, error } = await db
    .from('businesses')
    .select('*')
    .eq('verification_status', 'pending')
    .order('created_at', { ascending: true });

  if (error || !businesses || businesses.length === 0) return [];

  const businessIds = businesses.map((b: { id: string }) => b.id);
  const { data: offers } = await db.from('offers').select('*').in('business_id', businessIds);
  const { data: locations } = await db.from('locations').select('*').in('business_id', businessIds);

  const locationIds = (locations ?? []).map((l: { id: string }) => l.id);
  const { data: hours } = locationIds.length > 0
    ? await db.from('location_hours').select('*').in('location_id', locationIds)
    : { data: [] };

  const hoursByLocation = ((hours ?? []) as Array<LocationHour & { location_id: string }>).reduce<
    Record<string, LocationHour[]>
  >((acc, h) => {
    if (!acc[h.location_id]) acc[h.location_id] = [];
    acc[h.location_id].push(h);
    return acc;
  }, {});

  const locationsByBusiness = ((locations ?? []) as Array<{ business_id: string } & Omit<OfferLocation, 'hours'>>).reduce<
    Record<string, OfferLocation[]>
  >((acc, loc) => {
    if (!acc[loc.business_id]) acc[loc.business_id] = [];
    acc[loc.business_id].push({ ...loc, hours: hoursByLocation[loc.id] ?? [] });
    return acc;
  }, {});

  type PendingOfferRow = {
    id: string; business_id: string; description: string | null; price_type: string[] | null;
    eligibility: string[] | null; expires_at: string | null; is_active: boolean | null;
  };

  const offerByBusiness = ((offers ?? []) as PendingOfferRow[]).reduce<Record<string, PendingOfferRow>>(
    (acc, o) => {
      if (!acc[o.business_id]) acc[o.business_id] = o;
      return acc;
    },
    {}
  );

  return (businesses as Array<{
    id: string; name: string; description: string | null; notes: string | null;
    verification_status: string; created_at: string | null;
  }>)
    .filter((b) => offerByBusiness[b.id])
    .map((b) => {
      const offer = offerByBusiness[b.id];
      return {
        id: b.id,
        offer_id: offer.id,
        name: b.name,
        description: b.description ?? null,
        offer_desc: offer.description ?? null,
        price_type: offer.price_type ?? [],
        eligibility: offer.eligibility ?? [],
        expires_at: offer.expires_at ?? null,
        is_active: offer.is_active ?? null,
        notes: b.notes ?? null,
        verification_status: b.verification_status,
        created_at: b.created_at ?? null,
        locations: locationsByBusiness[b.id] ?? [],
      };
    });
}

export type ApproveResult = { success?: true; error?: string };

export async function setResourceVerificationStatus(
  businessId: string,
  offerId: string,
  status: 'verified' | 'rejected'
): Promise<ApproveResult> {
  const session = await requireAdmin();
  if (!session) return { error: 'Unauthorized.' };
  const db = makeUserClient(session.token);

  const { error: businessError } = await db
    .from('businesses')
    .update({ verification_status: status })
    .eq('id', businessId);
  if (businessError) return { error: businessError.message };

  const { error: offerError } = await db
    .from('offers')
    .update({ verification_status: status })
    .eq('id', offerId);
  if (offerError) return { error: offerError.message };

  return { success: true };
}

export async function setLocationVerificationStatus(
  id: string,
  status: 'verified' | 'rejected'
): Promise<ApproveResult> {
  const session = await requireAdmin();
  if (!session) return { error: 'Unauthorized.' };
  const db = makeUserClient(session.token);
  const { error } = await db.from('locations').update({ verification_status: status }).eq('id', id);
  if (error) return { error: error.message };
  return { success: true };
}

// ============================================================
// Geocoding
// ============================================================

const REJECTED_ACCURACY_TYPES = new Set([
  'street_center', 'place', 'county', 'state', 'country',
]);

type GeocodeResult = {
  lat: number;
  lng: number;
  accuracy: number;
  accuracy_type: string;
};

async function geocodeAddress(
  address: string,
  city: string,
  state: string,
  zip_code: string,
): Promise<GeocodeResult> {
  const apiKey = process.env.GEOCODIO_API_KEY;
  if (!apiKey) throw new Error('GEOCODIO_API_KEY is not configured');

  const q = encodeURIComponent(`${address}, ${city}, ${state} ${zip_code}`);
  const res = await fetch(`https://api.geocod.io/v1.7/geocode?q=${q}&api_key=${apiKey}`);
  if (!res.ok) throw new Error(`Geocodio API error: ${res.status} ${res.statusText}`);

  const data = await res.json() as {
    results?: Array<{
      location: { lat: number; lng: number };
      accuracy: number;
      accuracy_type: string;
    }>;
  };

  if (!data.results || data.results.length === 0) {
    throw new Error('no results returned');
  }

  const { location, accuracy, accuracy_type } = data.results[0];
  return { lat: location.lat, lng: location.lng, accuracy, accuracy_type };
}

// ============================================================
// CSV batch upload
//
// Each row creates one business + one offer (linked via offer_locations to
// the row's location, if any). offer_source has no column of its own in the
// new schema, so it's folded into the offer's notes as "Source: <url>"
// rather than silently dropped.
// ============================================================

export type CSVOfferRow = {
  name: string;
  description?: string;
  venue_type?: string;
  offer_desc?: string;
  offer_source?: string;
  price_type?: string[];
  eligibility?: string[];
  expires_at?: string;
  is_active?: boolean;
  notes?: string;
  location?: {
    address: string;
    address2?: string;
    city: string;
    state: string;
    zip_code: string;
    neighborhood?: string;
    phone_number?: string;
    notes?: string;
    hours?: Array<{
      day: string;
      opens_at: string;
      closes_at: string;
      notes?: string;
    }>;
  };
};

export type BatchUploadResult = {
  success?: true;
  created: number;
  skipped: number;
  error?: string;
};

export async function uploadOffers(
  rows: CSVOfferRow[],
  adminUserId: string
): Promise<BatchUploadResult> {
  const session = await requireAdmin();
  if (!session) return { created: 0, skipped: 0, error: 'Unauthorized. Please sign in as admin.' };

  const db = makeUserClient(session.token);
  let created = 0;
  let skipped = 0;
  let geocodeCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const csvRow = i + 2; // row 1 is the header

    const { data: existingBusiness } = await db
      .from('businesses')
      .select('id')
      .ilike('name', row.name)
      .maybeSingle();

    if (existingBusiness) {
      skipped++;
      continue;
    }

    let geocoded: GeocodeResult | null = null;

    if (row.location) {
      let locQuery = db
        .from('locations')
        .select('id')
        .ilike('address', row.location.address)
        .ilike('city', row.location.city);

      locQuery = row.location.address2
        ? locQuery.ilike('address2', row.location.address2)
        : locQuery.is('address2', null);

      const { data: existingLoc } = await locQuery.maybeSingle();
      if (existingLoc) {
        skipped++;
        continue;
      }

      if (geocodeCount > 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      geocodeCount++;

      const addrLabel = `${row.location.address}, ${row.location.city}, ${row.location.state} ${row.location.zip_code}`;
      try {
        geocoded = await geocodeAddress(
          row.location.address,
          row.location.city,
          row.location.state,
          row.location.zip_code,
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          created,
          skipped,
          error: `Row ${csvRow}: geocoding failed for "${addrLabel}" — ${msg}`,
        };
      }

      console.log(
        `[geocode] row ${csvRow} "${addrLabel}" → accuracy=${geocoded.accuracy} type=${geocoded.accuracy_type}`,
      );

      if (geocoded.accuracy < 0.8) {
        return {
          created,
          skipped,
          error: `Row ${csvRow}: geocoding accuracy too low (${geocoded.accuracy}) for "${addrLabel}" — fix the address and re-upload`,
        };
      }
      if (REJECTED_ACCURACY_TYPES.has(geocoded.accuracy_type)) {
        return {
          created,
          skipped,
          error: `Row ${csvRow}: geocoding accuracy type "${geocoded.accuracy_type}" is not precise enough for "${addrLabel}" — fix the address and re-upload`,
        };
      }
    }

    const { data: business, error: bizError } = await db
      .from('businesses')
      .insert({
        name: row.name,
        description: row.description ?? null,
        venue_type: row.venue_type ?? DEFAULT_VENUE_TYPE,
        verification_status: 'pending',
        created_by: adminUserId,
        notes: row.notes ?? null,
      })
      .select('id')
      .single();

    if (bizError || !business) {
      return { created, skipped, error: `Failed to create offer "${row.name}": ${bizError?.message}` };
    }

    const offerNotes = row.offer_source ? `Source: ${row.offer_source}` : null;
    const { data: offer, error: offerError } = await db
      .from('offers')
      .insert({
        business_id: business.id,
        name: row.name,
        description: row.offer_desc ?? null,
        price_type: row.price_type ?? [],
        eligibility: row.eligibility ?? [],
        expires_at: row.expires_at ?? null,
        is_active: row.is_active ?? true,
        verification_status: 'pending',
        created_by: adminUserId,
        notes: offerNotes,
      })
      .select('id')
      .single();

    if (offerError || !offer) {
      return { created, skipped, error: `Created business "${row.name}" but failed to create its offer: ${offerError?.message}` };
    }

    if (row.location) {
      const { data: location, error: locError } = await db.from('locations').insert({
        business_id: business.id,
        address: row.location.address,
        address2: row.location.address2 ?? null,
        city: row.location.city,
        state: row.location.state,
        zip_code: row.location.zip_code,
        neighborhood: row.location.neighborhood ?? null,
        phone_number: row.location.phone_number ?? null,
        notes: row.location.notes ?? null,
        latitude: geocoded?.lat ?? null,
        longitude: geocoded?.lng ?? null,
        verification_status: 'pending',
        created_by: adminUserId,
      }).select('id').single();
      if (locError || !location) {
        return {
          created,
          skipped,
          error: `Created offer "${row.name}" but failed to add its location: ${locError?.message}`,
        };
      }

      const { error: linkError } = await db.from('offer_locations').insert({
        offer_id: offer.id,
        location_id: location.id,
      });
      if (linkError) {
        return {
          created,
          skipped,
          error: `Created offer "${row.name}" and its location but failed to link them: ${linkError.message}`,
        };
      }

      if (row.location.hours && row.location.hours.length > 0) {
        const { error: hoursError } = await db.from('location_hours').insert(
          row.location.hours.map((h) => ({
            location_id: location.id,
            day: h.day,
            opens_at: h.opens_at,
            closes_at: h.closes_at,
            notes: h.notes ?? null,
          }))
        );
        if (hoursError) {
          return {
            created,
            skipped,
            error: `Created offer "${row.name}" but failed to add its hours: ${hoursError.message}`,
          };
        }
      }
    }

    created++;
  }

  return { success: true, created, skipped };
}
