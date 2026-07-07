import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { parseParams, type FilterState } from './searchFilters.url'

export type FilterKey = 'price' | 'foodType' | 'accessType' | 'eligibility'

export const PRICE_OPTIONS: { value: string; label: string; selectedClassName?: string }[] = [
  { value: 'free',     label: 'Free',     selectedClassName: 'bg-success border-success text-text-inverse' },
  { value: 'discount', label: 'Discount' },
]

export const FOOD_TYPE_OPTIONS = [
  { value: 'prepared',   label: 'Prepared' },
  { value: 'groceries',  label: 'Groceries' },
  { value: 'restaurant', label: 'Restaurant' },
]

export const ACCESS_OPTIONS = [
  { value: 'dine_in',  label: 'Dine in' },
  { value: 'pickup',   label: 'Pickup' },
  { value: 'delivery', label: 'Delivery' },
]

export const ELIGIBILITY_OPTIONS = [
  { value: 'anyone',             label: 'Anyone' },
  { value: 'honor_system',       label: 'Honor system' },
  { value: 'snap_ebt',           label: 'SNAP / EBT' },
  { value: 'wic',                label: 'WIC' },
  { value: 'seniors',            label: 'Seniors (65+)' },
  { value: 'children',           label: 'Children' },
  { value: 'income_restricted',  label: 'Income restricted' },
  { value: 'residency_required', label: 'Residency required' },
  { value: 'military_discount',  label: 'Military' },
]

interface SearchFiltersState extends FilterState {
  toggle: (key: FilterKey, value: string) => void
  toggleEligibility: (value: string) => void
  setFilter: (key: FilterKey, values: string[]) => void
  reset: () => void
  hydrateFromParams: (params: URLSearchParams) => void
}

const defaultFilters: FilterState = {
  price: ['free'],
  foodType: ['prepared'],
  accessType: ['pickup'],
  eligibility: ['anyone'],
}

// 'anyone' is exclusive in the UI — toggleEligibility never lets it coexist with
// other values. A hand-edited URL can still contain eligibility=anyone,seniors,
// so hydration has to re-enforce that invariant instead of setting parsed state as-is.
function sanitizeEligibility(eligibility: string[]): string[] {
  if (eligibility.length > 1 && eligibility.includes('anyone')) {
    return eligibility.filter((v) => v !== 'anyone')
  }
  return eligibility
}

export const useSearchFilters = create<SearchFiltersState>()(devtools((set, get) => ({
  ...defaultFilters,
  toggle(key, value) {
    set((state) => {
      const current = state[key]
      return {
        [key]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      }
    }, false, { type: 'toggle', key, value })
  },
  toggleEligibility(value) {
    const { eligibility, toggle, setFilter } = get()
    if (value === 'anyone') { toggle('eligibility', 'anyone'); return }
    if (eligibility.includes('anyone')) { setFilter('eligibility', [value]); return }
    toggle('eligibility', value)
  },
  setFilter(key, values) {
    set({ [key]: values }, false, { type: 'setFilter', key, values })
  },
  reset() {
    set(defaultFilters, false, { type: 'reset' })
  },
  hydrateFromParams(params) {
    const parsed = parseParams(params)
    set(
      { ...parsed, eligibility: sanitizeEligibility(parsed.eligibility) },
      false,
      { type: 'hydrateFromParams' }
    )
  },
}), { name: 'searchFilters' }))
