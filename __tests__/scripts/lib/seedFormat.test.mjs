import { describe, it, expect } from 'vitest'
import { sql, sqlArray } from '../../../scripts/lib/seedFormat.mjs'

describe('sql', () => {
  it('renders null as NULL', () => {
    expect(sql(null)).toBe('NULL')
  })

  it('renders undefined as NULL', () => {
    expect(sql(undefined)).toBe('NULL')
  })

  it('renders true as the bare word true', () => {
    expect(sql(true)).toBe('true')
  })

  it('renders false as the bare word false', () => {
    expect(sql(false)).toBe('false')
  })

  it('renders a number without quotes', () => {
    expect(sql(42)).toBe('42')
  })

  it('renders a float without quotes', () => {
    expect(sql(3.14)).toBe('3.14')
  })

  it('quotes a plain string', () => {
    expect(sql('hello')).toBe("'hello'")
  })

  it('escapes single quotes by doubling them', () => {
    expect(sql("O'Brien")).toBe("'O''Brien'")
  })

  it('escapes multiple single quotes', () => {
    expect(sql("it's a 'test'")).toBe("'it''s a ''test'''")
  })

  it('quotes an empty string (not treated as null)', () => {
    expect(sql('')).toBe("''")
  })
})

describe('sqlArray', () => {
  it('renders an empty array as NULL', () => {
    expect(sqlArray([], 'text')).toBe('NULL')
  })

  it('renders a null values argument as NULL', () => {
    expect(sqlArray(null, 'text')).toBe('NULL')
  })

  it('renders an undefined values argument as NULL', () => {
    expect(sqlArray(undefined, 'text')).toBe('NULL')
  })

  it('renders a string array with the given postgres type', () => {
    expect(sqlArray(['a', 'b'], 'text')).toBe("ARRAY['a','b']::text[]")
  })

  it('renders a single-element array', () => {
    expect(sqlArray(['pickup'], 'public.food_format')).toBe("ARRAY['pickup']::public.food_format[]")
  })

  it('escapes single quotes within array elements', () => {
    expect(sqlArray(["O'Brien"], 'text')).toBe("ARRAY['O''Brien']::text[]")
  })
})
