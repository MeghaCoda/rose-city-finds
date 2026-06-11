import { createSupabaseClient } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

export type LocationRow = Database['public']['Tables']['locations']['Row'] & {
  location_hours: Database['public']['Tables']['location_hours']['Row'][];
};

type LocationInsertRow = Database['public']['Tables']['locations']['Insert'];
type HoursInsertRow = Database['public']['Tables']['location_hours']['Insert'];

export async function fetchLocationById(id: string): Promise<LocationRow> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('locations')
    .select('*, location_hours(*)')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data as LocationRow;
}

export async function fetchActiveLocations(): Promise<LocationRow[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('locations')
    .select('*, location_hours(*)')
    .eq('is_active', true);
  if (error) throw new Error(error.message);
  return data as LocationRow[];
}

export async function insertLocation(row: LocationInsertRow): Promise<{ id: string }> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('locations')
    .insert(row)
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return data as { id: string };
}

export async function insertLocationHours(rows: HoursInsertRow[]): Promise<void> {
  const supabase = createSupabaseClient();
  const { error } = await supabase.from('location_hours').insert(rows);
  if (error) throw new Error(error.message);
}

export async function updateLocationRow(id: string, row: Partial<LocationInsertRow>): Promise<void> {
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from('locations')
    .update(row)
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteLocationHours(locationId: string): Promise<void> {
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from('location_hours')
    .delete()
    .eq('location_id', locationId);
  if (error) throw new Error(error.message);
}

export async function softDeleteLocation(id: string): Promise<void> {
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from('locations')
    .update({ is_active: false })
    .eq('id', id);
  if (error) throw new Error(error.message);
}
