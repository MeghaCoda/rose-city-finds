import { VALID_BENEFITS } from './uploadConstants';
import type { CSVOfferRow } from './actions';

export type ParseError = { row: number; message: string };
export type ParseResult = { rows: CSVOfferRow[]; errors: ParseError[] };

function parseCSVText(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i += 2; }
      else if (ch === '"') { inQuotes = false; i++; }
      else { field += ch; i++; }
    } else {
      if (ch === '"') { inQuotes = true; i++; }
      else if (ch === ',') { row.push(field.trim()); field = ''; i++; }
      else if (ch === '\n' || ch === '\r') {
        row.push(field.trim());
        field = '';
        if (row.some((c) => c !== '')) rows.push(row);
        row = [];
        if (ch === '\r' && text[i + 1] === '\n') i++;
        i++;
      } else { field += ch; i++; }
    }
  }
  if (field || row.length) {
    row.push(field.trim());
    if (row.some((c) => c !== '')) rows.push(row);
  }
  return rows;
}

export function parseOffersCSV(text: string): ParseResult {
  const rawRows = parseCSVText(text);
  if (rawRows.length === 0) {
    return { rows: [], errors: [{ row: 0, message: 'File is empty.' }] };
  }

  const headers = rawRows[0].map((h) => h.toLowerCase().replace(/\s+/g, '_'));
  const dataRows = rawRows.slice(1);
  const errors: ParseError[] = [];
  const rows: CSVOfferRow[] = [];

  const get = (row: string[], col: string): string => {
    const i = headers.indexOf(col);
    return i >= 0 ? (row[i] ?? '') : '';
  };

  for (let r = 0; r < dataRows.length; r++) {
    const rawRow = dataRows[r];
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

  return { rows, errors };
}
