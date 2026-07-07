'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { IconList, IconMap2 } from '@tabler/icons-react'
import dynamic from 'next/dynamic'
import type { ResourceWithLocation } from '@/schemas/zodSchema'
import { FILTER_CHIPS, API_ROUTES } from '@/lib/constants'
import { useSearchFilters, type FilterKey } from '@/stores/searchFilters.store'
import { toParams, hasFilterParams } from '@/stores/searchFilters.url'
import { useSyncFiltersWithUrl } from '@/hooks/useSyncFiltersWithUrl'
import { TabBar } from '@/components/ui/TabBar'
import { FilterChip } from '@/components/ui/FilterChip'
import { FilterDrawer } from '@/components/ui/FilterDrawer'
import { ResultListItem } from '@/components/ui/ResultListItem'
import { LIST_LABEL, MAP_LABEL, LOADING_RESOURCES } from './constants'

const LocationMap = dynamic(() => import('@/components/LocationMap/LocationMap'), { ssr: false })

type View = 'list' | 'map'

const TABS = [
  { value: 'list', label: LIST_LABEL, icon: <IconList size={15} stroke={1.5} /> },
  { value: 'map',  label: MAP_LABEL,  icon: <IconMap2 size={15} stroke={1.5} /> },
] satisfies { value: string; label: string; icon: React.ReactNode }[]

export function ResultsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  useSyncFiltersWithUrl()
  const [view, setView] = useState<View>('list')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { price, foodType, accessType, eligibility, toggle, toggleEligibility, reset } = useSearchFilters()

  function syncUrl() {
    const params = toParams(useSearchFilters.getState())
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  useEffect(() => {
    // A bare /results (no filter params) should adopt the store's current
    // defaults into the URL, so a shared/bookmarked link always carries the
    // actual filter values instead of silently relying on Zustand's initial state.
    if (!hasFilterParams(searchParams)) {
      syncUrl()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const { data: locations = [] } = useQuery<ResourceWithLocation[]>({
    queryKey: ['locations'],
    queryFn: () => fetch(API_ROUTES.LOCATIONS).then((r) => {
      if (!r.ok) throw new Error(`Failed to fetch locations: ${r.status}`);
      return r.json();
    }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  function isChipActive(key: FilterKey, value: string) {
    const state = { price, foodType, accessType, eligibility }
    return state[key].includes(value)
  }

  function toggleChip(key: FilterKey, value: string) {
    if (key === 'eligibility') {
      toggleEligibility(value)
    } else {
      toggle(key, value)
    }
    syncUrl()
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-surface-0">
      {/* Mobile-only: List/Map segmented toggle */}
      <TabBar
        tabs={TABS}
        activeTab={view}
        onTabChange={(v) => setView(v as View)}
        className="md:hidden"
      />

      {/* Filter chip row — horizontal scroll, only active selections */}
      <div className="flex gap-2 overflow-x-auto px-4 py-2.5 border-b border-border [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        {FILTER_CHIPS.filter((chip) => isChipActive(chip.key, chip.value)).map((chip) => (
          <FilterChip
            key={`${chip.key}-${chip.value}`}
            label={chip.label}
            selected
            onClick={() => toggleChip(chip.key, chip.value)}
            compact
            selectedClassName="bg-surface-1 border-primary text-text-primary"
          />
        ))}
        <FilterChip
          label="More +"
          selected={false}
          onClick={() => setDrawerOpen(true)}
          compact
        />
      </div>

      {/* Content area */}
      <div className="flex flex-1 min-h-0">
        {/* List panel */}
        <aside
          className={`${view === 'list' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 md:flex-shrink-0 overflow-y-auto md:border-r md:border-border`}
        >
          {locations.length === 0 && (
            <p className="px-4 py-8 text-sm text-text-muted text-center">
              {LOADING_RESOURCES}
            </p>
          )}
          {locations.map((item) => (
            <ResultListItem
              key={item.physical_location.id}
              name={item.name}
              address={[item.physical_location.address, item.physical_location.address2].filter(Boolean).join(', ')}
              description={item.description ?? undefined}
              selected={selectedId === item.id}
              onClick={() => setSelectedId(item.id)}
              onMouseEnter={() => setSelectedId(item.id)}
              onMouseLeave={() => setSelectedId(null)}
            />
          ))}
        </aside>

        {/* Map panel */}
        <div
          className={`${view === 'map' ? 'flex' : 'hidden'} md:flex flex-1 min-w-0 isolate`}
        >
          <LocationMap
            data={locations}
            selectedId={selectedId}
            onSelect={(item) => setSelectedId((item as ResourceWithLocation).id)}
          />
        </div>
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSearch={() => {
          setDrawerOpen(false)
          syncUrl()
        }}
        onClearFilters={() => {
          reset()
          syncUrl()
        }}
      />
    </div>
  )
}
