import { parse } from 'csv-parse/sync';
import { VALID_PRICE_TYPES, VALID_ELIGIBILITY_TYPES, VALID_VENUE_TYPES, DEFAULT_VENUE_TYPE } from './uploadConstants';
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

    const venueTypeRaw = get(rawRow, 'venue_type');
    let venue_type = DEFAULT_VENUE_TYPE;
    if (venueTypeRaw) {
      if (!VALID_VENUE_TYPES.has(venueTypeRaw as never)) {
        rowErrors.push(`invalid venue_type: ${venueTypeRaw}`);
      } else {
        venue_type = venueTypeRaw;
      }
    }

    let price_type: string[] | undefined;
    const priceTypeRaw = get(rawRow, 'price_type');
    if (priceTypeRaw) {
      const parts = priceTypeRaw.split(',').map((s) => s.trim()).filter(Boolean);
      const invalid = parts.filter((p) => !VALID_PRICE_TYPES.has(p as never));
      if (invalid.length > 0) {
        rowErrors.push(`invalid price_type values: ${invalid.join(', ')}`);
      } else {
        price_type = parts;
      }
    }

    let eligibility: string[] | undefined;
    const eligibilityRaw = get(rawRow, 'eligibility');
    if (eligibilityRaw) {
      const parts = eligibilityRaw.split(',').map((s) => s.trim()).filter(Boolean);
      const invalid = parts.filter((p) => !VALID_ELIGIBILITY_TYPES.has(p as never));
      if (invalid.length > 0) {
        rowErrors.push(`invalid eligibility values: ${invalid.join(', ')}`);
      } else {
        eligibility = parts;
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
          venue_type,
          offer_desc: get(rawRow, 'offer_desc') || undefined,
          offer_source: get(rawRow, 'offer_source') || undefined,
          price_type,
          eligibility,
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
