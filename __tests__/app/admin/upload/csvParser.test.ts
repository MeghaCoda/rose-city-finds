import { describe, it, expect } from 'vitest'
import { parseOffersCSV } from '@/app/admin/upload/csvParser'

const COLUMNS = [
  'name', 'description', 'venue_type', 'offer_desc', 'offer_source', 'price_type', 'eligibility',
  'expires_at', 'is_active', 'notes', 'address', 'address2', 'city', 'state', 'zip_code',
  'neighborhood', 'phone_number', 'location_notes',
] as const

const HEADER = COLUMNS.join(',')

function row(fields: Partial<Record<(typeof COLUMNS)[number], string>>): string {
  return COLUMNS.map((c) => {
    const v = fields[c] ?? ''
    return v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v
  }).join(',')
}

function csv(...rows: string[]) {
  return [HEADER, ...rows].join('\n')
}

describe('parseOffersCSV', () => {
  it('returns an error for an empty file', () => {
    const result = parseOffersCSV('')
    expect(result.rows).toHaveLength(0)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].message).toMatch(/empty/i)
  })

  it('parses a minimal valid row with no location', () => {
    const result = parseOffersCSV(csv(row({ name: 'Oregon Food Bank' })))
    expect(result.errors).toHaveLength(0)
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].name).toBe('Oregon Food Bank')
    expect(result.rows[0].location).toBeUndefined()
  })

  it('defaults venue_type to "other" when blank', () => {
    const result = parseOffersCSV(csv(row({ name: 'Test' })))
    expect(result.rows[0].venue_type).toBe('other')
  })

  it('parses a valid venue_type value', () => {
    const result = parseOffersCSV(csv(row({ name: 'Test', venue_type: 'food_pantry' })))
    expect(result.errors).toHaveLength(0)
    expect(result.rows[0].venue_type).toBe('food_pantry')
  })

  it('errors on an invalid venue_type value', () => {
    const result = parseOffersCSV(csv(row({ name: 'Test', venue_type: 'spaceship' })))
    expect(result.rows).toHaveLength(0)
    expect(result.errors[0].message).toMatch(/invalid venue_type/)
  })

  it('parses a row with valid price_type values', () => {
    const result = parseOffersCSV(csv(row({ name: 'Test', price_type: 'free,discount' })))
    expect(result.errors).toHaveLength(0)
    expect(result.rows[0].price_type).toEqual(['free', 'discount'])
  })

  it('errors on invalid price_type values', () => {
    const result = parseOffersCSV(csv(row({ name: 'Test', price_type: 'free,bogo' })))
    expect(result.rows).toHaveLength(0)
    expect(result.errors[0].message).toMatch(/invalid price_type values/)
    expect(result.errors[0].message).toContain('bogo')
  })

  it('parses a row with valid eligibility values', () => {
    const result = parseOffersCSV(csv(row({ name: 'Test', eligibility: 'senior,military' })))
    expect(result.errors).toHaveLength(0)
    expect(result.rows[0].eligibility).toEqual(['senior', 'military'])
  })

  it('errors on invalid eligibility values', () => {
    const result = parseOffersCSV(csv(row({ name: 'Test', eligibility: 'senior,invalid_value' })))
    expect(result.rows).toHaveLength(0)
    expect(result.errors[0].message).toMatch(/invalid eligibility values/)
    expect(result.errors[0].message).toContain('invalid_value')
  })

  it('parses is_active true and false correctly', () => {
    const trueResult = parseOffersCSV(csv(row({ name: 'Test A', is_active: 'true' })))
    const falseResult = parseOffersCSV(csv(row({ name: 'Test B', is_active: 'false' })))
    expect(trueResult.rows[0].is_active).toBe(true)
    expect(falseResult.rows[0].is_active).toBe(false)
  })

  it('errors when is_active is not "true" or "false"', () => {
    const result = parseOffersCSV(csv(row({ name: 'Test', is_active: 'yes' })))
    expect(result.errors[0].message).toMatch(/is_active must be/i)
  })

  it('leaves is_active undefined when the column is blank', () => {
    const result = parseOffersCSV(csv(row({ name: 'Test' })))
    expect(result.rows[0].is_active).toBeUndefined()
  })

  it('parses a row with a full location', () => {
    const result = parseOffersCSV(csv(row({
      name: 'Oregon Food Bank',
      address: '7900 NE 33rd Dr',
      city: 'Portland',
      state: 'OR',
      zip_code: '97211',
      neighborhood: 'Parkrose',
      phone_number: '503-282-0555',
      location_notes: 'Outdoor only',
    })))
    expect(result.errors).toHaveLength(0)
    const loc = result.rows[0].location
    expect(loc?.address).toBe('7900 NE 33rd Dr')
    expect(loc?.city).toBe('Portland')
    expect(loc?.state).toBe('OR')
    expect(loc?.zip_code).toBe('97211')
    expect(loc?.neighborhood).toBe('Parkrose')
    expect(loc?.phone_number).toBe('503-282-0555')
    expect(loc?.notes).toBe('Outdoor only')
  })

  it('errors when location is partial — address present but city/state/zip missing', () => {
    const result = parseOffersCSV(csv(row({ name: 'Test', address: '123 Main St' })))
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].message).toMatch(/location requires/)
    expect(result.errors[0].message).toContain('city')
    expect(result.errors[0].message).toContain('state')
    expect(result.errors[0].message).toContain('zip_code')
  })

  it('errors when name is missing', () => {
    const result = parseOffersCSV(csv(row({ description: 'Some description' })))
    expect(result.rows).toHaveLength(0)
    expect(result.errors[0].row).toBe(2)
    expect(result.errors[0].message).toMatch(/name is required/)
  })

  it('collects errors from multiple rows independently', () => {
    const result = parseOffersCSV(csv(
      row({ name: 'Valid Row' }),
      row({ description: 'Missing name field' }),
    ))
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].name).toBe('Valid Row')
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].row).toBe(3)
  })

  it('skips rows where all cells are empty', () => {
    const result = parseOffersCSV(`${HEADER}\n${row({ name: 'Valid Row' })}\n\n`)
    expect(result.rows).toHaveLength(1)
  })

  it('handles quoted fields containing commas', () => {
    const result = parseOffersCSV(csv(row({ name: 'Food, Drink & More' })))
    expect(result.errors).toHaveLength(0)
    expect(result.rows[0].name).toBe('Food, Drink & More')
  })
})
