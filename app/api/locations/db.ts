import { createSupabaseClient } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// The types below (ResourceHoursRow/ResourceRow/PhysicalLocationRow) no
// longer back any live query — resources/physical_locations/resource_hours
// were dropped in favor of businesses/offers/locations. They're kept only
// because __tests__/schemas/zodSchema.test.ts still exercises the matching
// zod schemas directly as schema-validation unit tests.
export type ResourceHoursRow = {
  id: string;
  physical_location_id: string;
  day: DayOfWeek;
  opens_at: string;
  closes_at: string;
  notes: string | null;
  valid_from: string | null;
  valid_until: string | null;
};

export type ResourceRow = {
  id: string;
  name: string;
  description: string | null;
  offer_desc: string | null;
  offer_source: string | null;
  benefits: string[] | null;
  verification_status: 'pending' | 'verified' | 'rejected' | 'delisted' | null;
  expires_at: string | null;
  is_active: boolean | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type PhysicalLocationRow = {
  id: string;
  resource_id: string;
  address: string;
  address2: string | null;
  city: string;
  state: string;
  zip_code: string;
  neighborhood: string | null;
  latitude: number;
  longitude: number;
  phone_number: string | null;
  verification_status: 'pending' | 'verified' | 'rejected' | 'delisted' | null;
  created_at: string | null;
  resources: ResourceRow | null;
  resource_hours: ResourceHoursRow[];
};

// ── New schema: businesses / offers / locations ────────────────────
// Rooted at locations (one row per physical location = one map pin),
// with the business it belongs to and the offers actually available
// there nested underneath. A location can host multiple offers from
// its business (via offer_locations), unlike the old 1:1 resource
// model, so this can't stay a flat row per resource.

type BusinessRow = Database['public']['Tables']['businesses']['Row'];
export type LocationRow = Database['public']['Tables']['locations']['Row'];
type OfferRow = Database['public']['Tables']['offers']['Row'];
export type LocationHoursRow = Database['public']['Tables']['location_hours']['Row'];
type OfferHoursTableRow = Database['public']['Tables']['offer_hours']['Row'];
type LocationInsertRow = Database['public']['Tables']['locations']['Insert'];
type LocationHoursInsertRow = Database['public']['Tables']['location_hours']['Insert'];

export type LocationWithOffersRow = LocationRow & {
  business: BusinessRow | null;
  location_hours: LocationHoursRow[];
  offer_locations: { offers: (OfferRow & { offer_hours: OfferHoursTableRow[] }) | null }[];
};

export async function fetchLocationsWithOffers(): Promise<LocationWithOffersRow[]> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from('locations')
    .select('*, business:businesses(*), location_hours(*), offer_locations(offers(*, offer_hours(*)))');
  if (error) throw new Error(error.message);
  return data as LocationWithOffersRow[];
}

export async function fetchLocationById(id: string): Promise<LocationRow & { location_hours: LocationHoursRow[] }> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from('locations')
    .select('*, location_hours(*)')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data as LocationRow & { location_hours: LocationHoursRow[] };
}

export async function insertLocation(row: Omit<LocationInsertRow, 'id' | 'created_at'>): Promise<{ id: string }> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from('locations')
    .insert(row)
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return data as { id: string };
}

export async function insertLocationHours(rows: Omit<LocationHoursInsertRow, 'id'>[]): Promise<void> {
  const supabase = await createSupabaseClient();
  const { error } = await supabase.from('location_hours').insert(rows);
  if (error) throw new Error(error.message);
}

export async function updateLocationRow(
  id: string,
  row: Partial<Omit<LocationInsertRow, 'id' | 'created_at'>>
): Promise<void> {
  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from('locations')
    .update(row)
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteLocationHours(locationId: string): Promise<void> {
  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from('location_hours')
    .delete()
    .eq('location_id', locationId);
  if (error) throw new Error(error.message);
}

// Deleting a location must clear its offer_locations links first — the FK
// has no ON DELETE cascade, and deleting the join rows only un-links the
// offers (the offers themselves, and any other locations they're linked
// to, are untouched).
export async function deleteOfferLocationsForLocation(locationId: string): Promise<void> {
  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from('offer_locations')
    .delete()
    .eq('location_id', locationId);
  if (error) throw new Error(error.message);
}

export async function deleteLocationRow(id: string): Promise<void> {
  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}
