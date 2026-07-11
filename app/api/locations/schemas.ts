import { z } from 'zod';
import { LocationsSchema, LocationHoursSchema } from '@/schemas/zodSchema';

export const LocationInputSchema = LocationsSchema
  .omit({ id: true })
  .extend({
    location_hours: z.array(
      LocationHoursSchema.omit({ id: true, location_id: true })
    ).optional(),
  });

export const LocationUpdateSchema = LocationInputSchema.partial();

export type LocationInput = z.infer<typeof LocationInputSchema>;
export type LocationUpdate = z.infer<typeof LocationUpdateSchema>;
