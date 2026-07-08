import { describe, it, expect } from 'vitest'
import { toParams, parseParams, filtersEqual, hasFilterParams, type FilterState } from '@/stores/searchFilters.url'

const CASES: FilterState[] = [
  { price: ['free'], foodType: ['prepared'], accessType: ['pickup'], eligibility: ['anyone'] },
  { price: [], foodType: [], accessType: [], eligibility: [] },
  { price: ['free', 'discount'], foodType: ['prepared', 'groceries', 'restaurant'], accessType: ['pickup'], eligibility: ['seniors', 'wic'] },
  { price: ['discount'], foodType: [], accessType: ['delivery', 'dine_in'], eligibility: ['anyone'] },
]

describe('toParams / parseParams round-trip', () => {
  it.each(CASES)('parseParams(toParams(x)) deep-equals x for %j', (filters) => {
    const params = toParams(filters)
    expect(parseParams(params)).toEqual(filters)
  })
})

describe('filtersEqual', () => {
  it('is true for identical filter states', () => {
    const a: FilterState = { price: ['free'], foodType: ['prepared'], accessType: ['pickup'], eligibility: ['anyone'] }
    const b: FilterState = { price: ['free'], foodType: ['prepared'], accessType: ['pickup'], eligibility: ['anyone'] }
    expect(filtersEqual(a, b)).toBe(true)
  })

  it('is order-insensitive within each array', () => {
    const a: FilterState = { price: ['free', 'discount'], foodType: [], accessType: [], eligibility: [] }
    const b: FilterState = { price: ['discount', 'free'], foodType: [], accessType: [], eligibility: [] }
    expect(filtersEqual(a, b)).toBe(true)
  })

  it('is false when a value differs', () => {
    const a: FilterState = { price: ['free'], foodType: [], accessType: [], eligibility: [] }
    const b: FilterState = { price: ['discount'], foodType: [], accessType: [], eligibility: [] }
    expect(filtersEqual(a, b)).toBe(false)
  })

  it('is false when array lengths differ', () => {
    const a: FilterState = { price: ['free', 'discount'], foodType: [], accessType: [], eligibility: [] }
    const b: FilterState = { price: ['free'], foodType: [], accessType: [], eligibility: [] }
    expect(filtersEqual(a, b)).toBe(false)
  })
})

describe('hasFilterParams', () => {
  it('is false for a bare URL with no params at all', () => {
    expect(hasFilterParams(new URLSearchParams())).toBe(false)
  })

  it('is false when only unrelated params are present', () => {
    expect(hasFilterParams(new URLSearchParams('utm_source=twitter'))).toBe(false)
  })

  it('is true when at least one filter key is present', () => {
    expect(hasFilterParams(new URLSearchParams('price=free'))).toBe(true)
  })

  it('is true when a filter key is present alongside unrelated params', () => {
    expect(hasFilterParams(new URLSearchParams('utm_source=twitter&eligibility=anyone'))).toBe(true)
  })
})
