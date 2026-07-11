import { LocationWithOffersSchema, LocationWithHoursSchema } from '@/schemas/zodSchema';
import type { LocationWithOffers, LocationWithHours } from '@/schemas/zodSchema';
import type { LocationWithOffersRow, LocationHoursRow } from './db';
import type { LocationInput, LocationUpdate } from './schemas';
import {
  fetchLocationsWithOffers,
  fetchLocationById,
  insertLocation,
  insertLocationHours,
  updateLocationRow,
  deleteLocationHours,
  deleteOfferLocationsForLocation,
  deleteLocationRow,
} from './db';

function formatLocationWithOffers(row: LocationWithOffersRow): unknown {
  const business = row.business;
  return {
    id: row.id,
    business_id: row.business_id,
    address: row.address,
    address2: row.address2,
    city: row.city,
    state: row.state,
    zip_code: row.zip_code,
    neighborhood: row.neighborhood,
    latitude: row.latitude,
    longitude: row.longitude,
    phone_number: row.phone_number,
    food_formats: row.food_formats,
    verification_status: row.verification_status,
    notes: row.notes,
    business: business && {
      id: business.id,
      name: business.name,
      description: business.description,
      venue_type: business.venue_type,
      verification_status: business.verification_status,
      is_active: business.is_active,
      notes: business.notes,
    },
    location_hours: (row.location_hours ?? []).map((h) => ({
      id: h.id,
      day: h.day,
      opens_at: h.opens_at,
      closes_at: h.closes_at,
      notes: h.notes,
      valid_from: h.valid_from,
      valid_until: h.valid_until,
    })),
    offers: (row.offer_locations ?? [])
      .map((ol) => ol.offers)
      .filter((offer) => offer !== null)
      .map((offer) => ({
        id: offer.id,
        business_id: offer.business_id,
        name: offer.name,
        description: offer.description,
        price_type: offer.price_type,
        eligibility: offer.eligibility,
        proof_required: offer.proof_required,
        proof_desc: offer.proof_desc,
        expires_at: offer.expires_at,
        is_seasonal: offer.is_seasonal,
        season_start_date: offer.season_start_date,
        season_end_date: offer.season_end_date,
        is_active: offer.is_active,
        verification_status: offer.verification_status,
        notes: offer.notes,
        offer_hours: (offer.offer_hours ?? []).map((h) => ({
          id: h.id,
          day: h.day,
          opens_at: h.opens_at,
          closes_at: h.closes_at,
          notes: h.notes,
          valid_from: h.valid_from,
          valid_until: h.valid_until,
        })),
      })),
  };
}

function formatLocationWithHours(row: { location_hours: LocationHoursRow[] } & Record<string, unknown>): unknown {
  return {
    ...row,
    location_hours: (row.location_hours ?? []).map((h) => ({
      id: h.id,
      day: h.day,
      opens_at: h.opens_at,
      closes_at: h.closes_at,
      notes: h.notes,
      valid_from: h.valid_from,
      valid_until: h.valid_until,
    })),
  };
}

function inputToLocationRow(data: Partial<LocationInput>) {
  return {
    ...(data.business_id !== undefined && { business_id: data.business_id }),
    ...(data.address !== undefined && { address: data.address }),
    ...(data.address2 !== undefined && { address2: data.address2 ?? null }),
    ...(data.city !== undefined && { city: data.city }),
    ...(data.state !== undefined && { state: data.state }),
    ...(data.zip_code !== undefined && { zip_code: data.zip_code }),
    ...(data.neighborhood !== undefined && { neighborhood: data.neighborhood ?? null }),
    ...(data.latitude !== undefined && { latitude: data.latitude }),
    ...(data.longitude !== undefined && { longitude: data.longitude }),
    ...(data.phone_number !== undefined && { phone_number: data.phone_number ?? null }),
    ...(data.food_formats !== undefined && { food_formats: data.food_formats }),
    ...(data.verification_status !== undefined && { verification_status: data.verification_status }),
    ...(data.notes !== undefined && { notes: data.notes ?? null }),
  };
}

async function getLocationById(id: string): Promise<LocationWithHours> {
  const row = await fetchLocationById(id);
  const formatted = formatLocationWithHours(row);
  const result = LocationWithHoursSchema.safeParse(formatted);
  if (!result.success) {
    throw new Error(`Invalid location data: ${JSON.stringify(result.error.flatten())}`);
  }
  return result.data;
}

export async function getLocations(): Promise<LocationWithOffers[]> {
  const rows = await fetchLocationsWithOffers();
  return rows.reduce<LocationWithOffers[]>((acc, row) => {
    const formatted = formatLocationWithOffers(row);
    const result = LocationWithOffersSchema.safeParse(formatted);
    if (result.success) {
      acc.push(result.data);
    } else {
      console.error(`Invalid location ${row.id}:`, result.error.flatten());
    }
    return acc;
  }, []);
}

export async function createLocation(
  data: LocationInput
): Promise<LocationWithHours> {
  const { location_hours, ...locationData } = data;
  const loc = await insertLocation(
    inputToLocationRow(locationData) as Parameters<typeof insertLocation>[0]
  );

  if (location_hours && location_hours.length > 0) {
    await insertLocationHours(
      location_hours.map((h) => ({
        ...h,
        location_id: loc.id,
        notes: h.notes ?? null,
        valid_from: h.valid_from ?? null,
        valid_until: h.valid_until ?? null,
      }))
    );
  }

  return getLocationById(loc.id);
}

export async function updateLocation(
  id: string,
  data: LocationUpdate
): Promise<LocationWithHours> {
  const { location_hours, ...locationData } = data;
  await updateLocationRow(id, inputToLocationRow(locationData));

  if (location_hours !== undefined) {
    await deleteLocationHours(id);
    if (location_hours.length > 0) {
      await insertLocationHours(
        location_hours.map((h) => ({
          ...h,
          location_id: id,
          notes: h.notes ?? null,
          valid_from: h.valid_from ?? null,
          valid_until: h.valid_until ?? null,
        }))
      );
    }
  }

  return getLocationById(id);
}

export async function deleteLocation(id: string): Promise<void> {
  await deleteLocationHours(id);
  await deleteOfferLocationsForLocation(id);
  await deleteLocationRow(id);
}
