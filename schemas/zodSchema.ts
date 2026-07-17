import { z } from "zod";

// ============================================================
// ENUMS
// ============================================================

export const UserRoleSchema = z.enum(["admin", "owner", "contributor", "viewer"]);

export const VerificationStatusSchema = z.enum(["pending", "verified", "rejected", "delisted"]);

export const VenueTypeSchema = z.enum([
  "food_pantry",
  "food_bank",
  "restaurant",
  "cafe",
  "grocery_store",
  "farmers_market",
  "community_organization",
  "other",
]);

export const PriceTypeSchema = z.enum(["free", "discount"]);

export const EligibilityTypeSchema = z.enum([
  "anyone",
  "student",
  "senior",
  "kids",
  "military",
  "snap",
  "income_requirement",
  "other",
]);

export const FoodFormatSchema = z.enum(["dine_in", "grocery", "pickup", "delivery"]);

export const DayOfWeekSchema = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

// ============================================================
// USERS
// ============================================================

export const UsersSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(1),
  email: z.string().email(),
  role: UserRoleSchema,
  created_at: z.string().datetime({ offset: true }).nullable().optional(),
});

export type User = z.infer<typeof UsersSchema>;

// ============================================================
// BUSINESSES
// ============================================================

export const BusinessesSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  venue_type: VenueTypeSchema,
  verification_status: VerificationStatusSchema,
  is_active: z.boolean(),
  notes: z.string().nullable().optional(),
});

export type Business = z.infer<typeof BusinessesSchema>;

// ============================================================
// LOCATIONS (new normalized shape)
// ============================================================

export const LocationsSchema = z.object({
  id: z.string().uuid(),
  business_id: z.string().uuid(),
  address: z.string().min(1),
  address2: z.string().nullable().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip_code: z.string().min(5).max(10),
  neighborhood: z.string().nullable().optional(),
  latitude: z.number(),
  longitude: z.number(),
  phone_number: z.string().nullable().optional(),
  food_formats: z.array(FoodFormatSchema),
  verification_status: VerificationStatusSchema,
  verification_status_changed_at: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  hours_notes: z.string().nullable().optional(),
});

export type Location = z.infer<typeof LocationsSchema>;

// ============================================================
// OFFERS
// ============================================================

export const OffersSchema = z.object({
  id: z.string().uuid(),
  business_id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  price_type: z.array(PriceTypeSchema),
  eligibility: z.array(EligibilityTypeSchema),
  proof_required: z.boolean(),
  proof_desc: z.string().nullable().optional(),
  expires_at: z.string().nullable().optional(), // date string e.g. "2025-12-31"
  is_seasonal: z.boolean(),
  season_start_date: z.string().nullable().optional(),
  season_end_date: z.string().nullable().optional(),
  is_active: z.boolean(),
  verification_status: VerificationStatusSchema,
  verification_status_changed_at: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  hours_notes: z.string().nullable().optional(),
});

export type Offer = z.infer<typeof OffersSchema>;

// ============================================================
// LOCATION HOURS / OFFER HOURS
// ============================================================

export const LocationHoursSchema = z.object({
  id: z.string().uuid(),
  location_id: z.string().uuid(),
  day: DayOfWeekSchema,
  opens_at: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Must be a valid time e.g. 09:00"),
  closes_at: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Must be a valid time e.g. 17:00"),
  valid_from: z.string().nullable().optional(),
  valid_until: z.string().nullable().optional(),
});

export type LocationHours = z.infer<typeof LocationHoursSchema>;

export const OfferHoursSchema = z.object({
  id: z.string().uuid(),
  offer_id: z.string().uuid(),
  day: DayOfWeekSchema,
  opens_at: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Must be a valid time e.g. 09:00"),
  closes_at: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Must be a valid time e.g. 17:00"),
  valid_from: z.string().nullable().optional(),
  valid_until: z.string().nullable().optional(),
});

export type OfferHours = z.infer<typeof OfferHoursSchema>;

// ============================================================
// LOCATION WITH HOURS (write-path response for /api/locations —
// a location doesn't own or create offers, so this stays scoped to
// just the location entity and its own hours)
// ============================================================

export const LocationWithHoursSchema = LocationsSchema.extend({
  location_hours: z.array(LocationHoursSchema.omit({ id: true, location_id: true })),
});

export type LocationWithHours = z.infer<typeof LocationWithHoursSchema>;

// ============================================================
// LOCATION WITH OFFERS (joined view for map/results — one row per
// physical location, each with the offers actually available there,
// so a location with multiple offers gets one pin, not duplicates)
// ============================================================

export const OfferWithHoursSchema = OffersSchema.extend({
  offer_hours: z.array(OfferHoursSchema.omit({ id: true, offer_id: true })),
});

export type OfferWithHours = z.infer<typeof OfferWithHoursSchema>;

export const LocationWithOffersSchema = LocationsSchema.extend({
  business: BusinessesSchema,
  location_hours: z.array(LocationHoursSchema.omit({ id: true, location_id: true })),
  offers: z.array(OfferWithHoursSchema),
});

export type LocationWithOffers = z.infer<typeof LocationWithOffersSchema>;

// ============================================================
// ARRAY SCHEMAS (for validating lists of records from DB queries)
// ============================================================

export const UsersArraySchema = z.array(UsersSchema);
export const BusinessesArraySchema = z.array(BusinessesSchema);
export const LocationsArraySchema = z.array(LocationsSchema);
export const OffersArraySchema = z.array(OffersSchema);
export const LocationWithOffersArraySchema = z.array(LocationWithOffersSchema);

// ============================================================
// SAFE PARSE HELPER (with detailed error logging)
// ============================================================

export function safeParsWithDebug<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  label?: string
): T | null {
  const result = schema.safeParse(data);

  if (!result.success) {
    console.error(`Zod validation failed${label ? ` [${label}]` : ""}:`);
    result.error.issues.forEach((issue) => {
      const index = issue.path[0];
      const field = issue.path[1];
      const failedRecord = Array.isArray(data) ? (data as unknown[])[index as number] : data;
      const recordId =
        failedRecord && typeof failedRecord === "object" && "id" in failedRecord
          ? failedRecord.id
          : null;

      console.error({
        message: issue.message,
        field,
        index,
        failedRecord,
        recordId,
      });
    });
    return null;
  }

  return result.data;
}
