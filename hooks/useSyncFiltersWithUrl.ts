'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'
import { useSearchFilters } from '@/stores/searchFilters.store'
import { parseParams, filtersEqual, hasFilterParams } from '@/stores/searchFilters.url'

export function useSyncFiltersWithUrl() {
  const searchParams = useSearchParams()
  const { price, foodType, accessType, eligibility, hydrateFromParams } = useSearchFilters(
    useShallow((state) => ({
      price: state.price,
      foodType: state.foodType,
      accessType: state.accessType,
      eligibility: state.eligibility,
      hydrateFromParams: state.hydrateFromParams,
    }))
  )

  useEffect(() => {
    // A bare URL (no filter keys at all) carries no intent to hydrate from —
    // the store's own defaults are authoritative there. Hydrating from an
    // empty parse would wipe them instead of the URL adopting them.
    if (!hasFilterParams(searchParams)) {
      return
    }
    const parsed = parseParams(searchParams)
    const current = { price, foodType, accessType, eligibility }
    if (!filtersEqual(parsed, current)) {
      hydrateFromParams(searchParams)
    }
    // Only react to URL changes — comparing against current store state inside
    // the effect (not as a dep) is what keeps this from re-running on every
    // store-driven change and fighting the replace() calls that caused them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])
}
