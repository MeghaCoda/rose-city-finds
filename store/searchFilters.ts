import { create } from 'zustand'

export type FilterKey = 'price' | 'foodType' | 'accessType' | 'eligibility'

interface SearchFiltersState {
  price: string[]
  foodType: string[]
  accessType: string[]
  eligibility: string[]
  toggle: (key: FilterKey, value: string) => void
  setFilter: (key: FilterKey, values: string[]) => void
  reset: () => void
  toParams: () => URLSearchParams
}

const defaultFilters = {
  price: ['free'] as string[],
  foodType: ['prepared', 'groceries', 'restaurant'] as string[],
  accessType: ['pickup', 'delivery', 'dine_in'] as string[],
  eligibility: ['anyone'] as string[],
}

export const useSearchFilters = create<SearchFiltersState>((set, get) => ({
  ...defaultFilters,
  toggle(key, value) {
    set((state) => {
      const current = state[key]
      return {
        [key]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      }
    })
  },
  setFilter(key, values) {
    set({ [key]: values })
  },
  reset() {
    set(defaultFilters)
  },
  toParams() {
    const { price, foodType, accessType, eligibility } = get()
    const params = new URLSearchParams()
    if (price.length) params.set('price', price.join(','))
    if (foodType.length) params.set('foodType', foodType.join(','))
    if (accessType.length) params.set('accessType', accessType.join(','))
    if (eligibility.length) params.set('eligibility', eligibility.join(','))
    return params
  },
}))
