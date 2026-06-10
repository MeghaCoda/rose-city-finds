import { createSupabaseClient } from '@/lib/supabase';
import { DAYS } from '@/lib/constants';
import { DayOfWeek } from '@/types/utils';
import type { Database } from '@/types/supabase';
import { LocationSchema } from '@/schemas/zodSchema';
import type { Location } from '@/schemas/zodSchema';

type LocationRow = Database['public']['Tables']['locations']['Row'] & {
  location_hours: Database['public']['Tables']['location_hours']['Row'][];
};

function formatLocation(loc: LocationRow): unknown {
  const hours = Object.fromEntries(
    DAYS.map((day) => [day, []])
  ) as unknown as Record<DayOfWeek, { start: string; end: string }[]>;

  for (const h of loc.location_hours ?? []) {
    if (h.opens_at && h.closes_at) {
      hours[h.day as DayOfWeek].push({
        start: h.opens_at.slice(0, 5),
        end: h.closes_at.slice(0, 5),
      });
    }
  }

  return {
    id: loc.id,
    name: loc.name,
    address: loc.address,
    address2: loc.address2 ?? '',
    city: loc.city,
    state: loc.state,
    zipCode: loc.zip_code ?? loc.zip ?? '',
    latitude: loc.latitude ?? 0,
    longitude: loc.longitude ?? 0,
    offerDesc: loc.offer_desc ?? '',
    offerSource: loc.offer_source ?? '',
    website: loc.website ?? undefined,
    donationLink: loc.donation_link ?? undefined,
    deliveryAvailable: loc.delivery_available ?? false,
    volunteerLink: loc.volunteer_link ?? undefined,
    phoneNumber: loc.phone ?? '',
    hours,
    infoLastVerified: loc.info_last_verified ?? '',
    lastUpdated: loc.updated_at,
    notes: loc.description ?? '',
  };
}

export async function getLocations(): Promise<Location[]> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('locations')
    .select('*, location_hours(*)')
    .eq('is_active', true);

  if (error) {
    throw new Error(error.message);
  }

  return data.reduce<Location[]>((acc, loc) => {
    const result = LocationSchema.safeParse(formatLocation(loc));
    if (result.success) {
      acc.push(result.data);
    } else {
      console.error(`Invalid location ${loc.id}:`, result.error.flatten());
    }
    return acc;
  }, []);
}