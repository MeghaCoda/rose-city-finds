import { describe, it, expect } from 'vitest'
import { parseOffersCSV } from '@/app/admin/upload/csvParser'

const HEADER = 'name,description,offer_desc,offer_source,benefits,expires_at,is_active,notes,address,address2,city,state,zip_code,neighborhood,phone_number,location_notes'

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
    const result = parseOffersCSV(csv('Oregon Food Bank,,,,,,,,,,,,,,,,'))
    expect(result.errors).toHaveLength(0)
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].name).toBe('Oregon Food Bank')
    expect(result.rows[0].location).toBeUndefined()
  })

  it('parses a row with valid benefit values', () => {
    const result = parseOffersCSV(csv('Test,,,,"free_food,snap_accepted",,,,,,,,,,,,'))
    expect(result.errors).toHaveLength(0)
    expect(result.rows[0].benefits).toEqual(['free_food', 'snap_accepted'])
  })

  it('errors on invalid benefit values', () => {
    const result = parseOffersCSV(csv('Test,,,,"free_food,invalid_benefit",,,,,,,,,,,,'))
    expect(result.rows).toHaveLength(0)
    expect(result.errors[0].message).toMatch(/invalid benefit values/)
    expect(result.errors[0].message).toContain('invalid_benefit')
  })

  it('parses is_active true and false correctly', () => {
    const trueResult = parseOffersCSV(csv('Test A,,,,,,true,,,,,,,,,,'))
    const falseResult = parseOffersCSV(csv('Test B,,,,,,false,,,,,,,,,,'))
    expect(trueResult.rows[0].is_active).toBe(true)
    expect(falseResult.rows[0].is_active).toBe(false)
  })

  it('errors when is_active is not "true" or "false"', () => {
    const result = parseOffersCSV(csv('Test,,,,,,yes,,,,,,,,,,'))
    expect(result.errors[0].message).toMatch(/is_active must be/i)
  })

  it('leaves is_active undefined when the column is blank', () => {
    const result = parseOffersCSV(csv('Test,,,,,,,,,,,,,,,,'))
    expect(result.rows[0].is_active).toBeUndefined()
  })

  it('parses a row with a full location', () => {
    const row = 'Oregon Food Bank,,,,,,,,7900 NE 33rd Dr,,Portland,OR,97211,Parkrose,503-282-0555,Outdoor only'
    const result = parseOffersCSV(csv(row))
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
    const row = 'Test,,,,,,,,123 Main St,,,,,,'
    const result = parseOffersCSV(csv(row))
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].message).toMatch(/location requires/)
    expect(result.errors[0].message).toContain('city')
    expect(result.errors[0].message).toContain('state')
    expect(result.errors[0].message).toContain('zip_code')
  })

  it('errors when name is missing', () => {
    const result = parseOffersCSV(csv(',Some description,,,,,,,,,,,,,,'))
    expect(result.rows).toHaveLength(0)
    expect(result.errors[0].row).toBe(2)
    expect(result.errors[0].message).toMatch(/name is required/)
  })

  it('collects errors from multiple rows independently', () => {
    const result = parseOffersCSV(csv(
      'Valid Row,,,,,,,,,,,,,,,,',
      ',Missing name field,,,,,,,,,,,,,,,'  // non-empty row but no name
    ))
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].name).toBe('Valid Row')
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].row).toBe(3)
  })

  it('skips rows where all cells are empty', () => {
    const result = parseOffersCSV(`${HEADER}\nValid Row,,,,,,,,,,,,,,,,,\n\n`)
    expect(result.rows).toHaveLength(1)
  })

  it('handles quoted fields containing commas', () => {
    const result = parseOffersCSV(csv('"Food, Drink & More",,,,,,,,,,,,,,,,'))
    expect(result.errors).toHaveLength(0)
    expect(result.rows[0].name).toBe('Food, Drink & More')
  })
})
