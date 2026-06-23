import { parse } from 'csv-parse/sync';
import { VALID_BENEFITS } from './uploadConstants';
import type { CSVOfferRow } from './actions';

export type ParseError = { row: number; message: string };
export type ParseResult = { rows: CSVOfferRow[]; errors: ParseError[] };

export function parseOffersCSV(text: string): ParseResult {
  let rawRows: Record<string, string>[];
  try {
    rawRows = parse(text, {
      columns: (header: string[]) => header.map((h) => h.toLowerCase().replace(/\s+/g, '_')),
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    }) as Record<string, string>[];
  } catch {
    return { rows: [], errors: [{ row: 0, message: 'File is empty.' }] };
  }

  if (rawRows.length === 0) {
    return { rows: [], errors: [{ row: 0, message: 'File is empty.' }] };
  }

  const errors: ParseError[] = [];
  const rows: CSVOfferRow[] = [];
  const seenNames = new Set<string>();
  const seenLocations = new Set<string>();

  const get = (row: Record<string, string>, col: string): string => row[col] ?? '';

  for (let r = 0; r < rawRows.length; r++) {
    const rawRow = rawRows[r];
    const rowNum = r + 2;
    const rowErrors: string[] = [];

    const name = get(rawRow, 'name');
    if (!name) rowErrors.push('name is required');

    let benefits: string[] | undefined;
    const benefitsRaw = get(rawRow, 'benefits');
    if (benefitsRaw) {
      const parts = benefitsRaw.split(',').map((s) => s.trim()).filter(Boolean);
      const invalid = parts.filter((p) => !VALID_BENEFITS.has(p as never));
      if (invalid.length > 0) {
        rowErrors.push(`invalid benefit values: ${invalid.join(', ')}`);
      } else {
        benefits = parts;
      }
    }

    let is_active: boolean | undefined;
    const isActiveRaw = get(rawRow, 'is_active').toLowerCase();
    if (isActiveRaw === 'true') is_active = true;
    else if (isActiveRaw === 'false') is_active = false;
    else if (isActiveRaw) rowErrors.push('is_active must be "true" or "false"');

    const address = get(rawRow, 'address');
    const city = get(rawRow, 'city');
    const state = get(rawRow, 'state');
    const zip_code = get(rawRow, 'zip_code');
    const hasAnyLocation = !!(
      address || city || state || zip_code ||
      get(rawRow, 'address2') || get(rawRow, 'neighborhood') || get(rawRow, 'phone_number')
    );

    let location: CSVOfferRow['location'];
    if (hasAnyLocation) {
      const missing: string[] = [];
      if (!address) missing.push('address');
      if (!city) missing.push('city');
      if (!state) missing.push('state');
      if (!zip_code) missing.push('zip_code');
      if (missing.length > 0) {
        rowErrors.push(`location requires: ${missing.join(', ')}`);
      } else {
        location = {
          address,
          address2: get(rawRow, 'address2') || undefined,
          city,
          state,
          zip_code,
          neighborhood: get(rawRow, 'neighborhood') || undefined,
          phone_number: get(rawRow, 'phone_number') || undefined,
          notes: get(rawRow, 'location_notes') || undefined,
        };
      }
    }

    if (rowErrors.length > 0) {
      rowErrors.forEach((msg) => errors.push({ row: rowNum, message: msg }));
    } else if (name) {
      const nameKey = name.toLowerCase();
      const locKey = location
        ? [location.address, location.address2 ?? '', location.city].join('|').toLowerCase()
        : null;

      if (seenNames.has(nameKey)) {
        errors.push({ row: rowNum, message: `duplicate resource name "${name}"` });
      } else if (locKey !== null && seenLocations.has(locKey)) {
        errors.push({ row: rowNum, message: `duplicate location: "${location!.address}, ${location!.city}" already appears in this file` });
      } else {
        seenNames.add(nameKey);
        if (locKey !== null) seenLocations.add(locKey);
        rows.push({
          name,
          description: get(rawRow, 'description') || undefined,
          offer_desc: get(rawRow, 'offer_desc') || undefined,
          offer_source: get(rawRow, 'offer_source') || undefined,
          benefits,
          expires_at: get(rawRow, 'expires_at') || undefined,
          is_active,
          notes: get(rawRow, 'notes') || undefined,
          location,
        });
      }
    }
  }

  return { rows, errors };
}
