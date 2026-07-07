export interface FilterState {
  price: string[]
  foodType: string[]
  accessType: string[]
  eligibility: string[]
}

export function toParams(filters: FilterState): URLSearchParams {
  const { price, foodType, accessType, eligibility } = filters
  const params = new URLSearchParams()
  if (price.length) params.set('price', price.join(','))
  if (foodType.length) params.set('foodType', foodType.join(','))
  if (accessType.length) params.set('accessType', accessType.join(','))
  if (eligibility.length) params.set('eligibility', eligibility.join(','))
  return params
}

const FILTER_KEYS = ['price', 'foodType', 'accessType', 'eligibility'] as const

export function hasFilterParams(searchParams: URLSearchParams): boolean {
  return FILTER_KEYS.some((key) => searchParams.has(key))
}

export function parseParams(searchParams: URLSearchParams): FilterState {
  function parse(key: string): string[] {
    return searchParams.get(key)?.split(',').filter(Boolean) ?? []
  }
  return {
    price: parse('price'),
    foodType: parse('foodType'),
    accessType: parse('accessType'),
    eligibility: parse('eligibility'),
  }
}

export function filtersEqual(a: FilterState, b: FilterState): boolean {
  function sortedEqual(x: string[], y: string[]): boolean {
    if (x.length !== y.length) return false
    const sx = [...x].sort()
    const sy = [...y].sort()
    return sx.every((v, i) => v === sy[i])
  }
  return (
    sortedEqual(a.price, b.price) &&
    sortedEqual(a.foodType, b.foodType) &&
    sortedEqual(a.accessType, b.accessType) &&
    sortedEqual(a.eligibility, b.eligibility)
  )
}
