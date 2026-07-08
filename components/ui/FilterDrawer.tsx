'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Dialog } from '@base-ui/react/dialog'
import { IconX } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { FilterChip } from './FilterChip'
import {
  useSearchFilters,
  PRICE_OPTIONS,
  FOOD_TYPE_OPTIONS,
  ACCESS_OPTIONS,
  ELIGIBILITY_OPTIONS,
  type FilterKey,
} from '@/stores/searchFilters.store'
import { toParams } from '@/stores/searchFilters.url'

// ─── Sub-component ──────────────────────────────────────────────────────────────

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <p className="w-28 shrink-0 pt-1.5 text-xs font-semibold tracking-widest uppercase text-text-muted">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

// ─── Props ──────────────────────────────────────────────────────────────────────

export interface FilterDrawerProps {
  open: boolean
  onClose: () => void
  onSearch: () => void
  onClearFilters: () => void
  className?: string
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function FilterDrawer({
  open,
  onClose,
  onSearch,
  onClearFilters,
  className,
}: FilterDrawerProps) {
  const { price, foodType, accessType, eligibility, toggle, toggleEligibility } = useSearchFilters()
  const router = useRouter()
  const pathname = usePathname()

  function syncUrl() {
    const params = toParams(useSearchFilters.getState())
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function handleToggle(key: FilterKey, value: string) {
    toggle(key, value)
    syncUrl()
  }

  function handleEligibilityToggle(value: string) {
    toggleEligibility(value)
    syncUrl()
  }

  const totalActive =
    price.length +
    foodType.length +
    accessType.length +
    eligibility.filter((v) => v !== 'anyone').length

  return (
    <Dialog.Root open={open} onOpenChange={(next) => { if (!next) onClose() }}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Backdrop className="fixed inset-0 bg-black/30 z-40" />

        {/* Drawer panel */}
        <Dialog.Popup
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex flex-col w-full md:max-w-sm bg-surface-1 shadow-2xl',
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
            <Dialog.Title className="text-base font-semibold text-text-primary">
              Filters{totalActive > 0 ? ` (${totalActive})` : ''}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close filters"
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-0 active:scale-90 active:bg-surface-0 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <IconX size={18} />
            </Dialog.Close>
          </div>

          {/* Body: all filter groups stacked */}
          <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
            <FilterGroup label="Price">
              {PRICE_OPTIONS.map(({ value, label, selectedClassName }) => (
                <FilterChip
                  key={value}
                  label={label}
                  selected={price.includes(value)}
                  onClick={() => handleToggle('price', value)}
                  selectedClassName={selectedClassName}
                  compact
                />
              ))}
            </FilterGroup>

            <div className="border-t border-border" />

            <FilterGroup label="Food type">
              {FOOD_TYPE_OPTIONS.map(({ value, label }) => (
                <FilterChip
                  key={value}
                  label={label}
                  selected={foodType.includes(value)}
                  onClick={() => handleToggle('foodType', value)}
                  compact
                />
              ))}
            </FilterGroup>

            <div className="border-t border-border" />

            <FilterGroup label="How you get it">
              {ACCESS_OPTIONS.map(({ value, label }) => (
                <FilterChip
                  key={value}
                  label={label}
                  selected={accessType.includes(value)}
                  onClick={() => handleToggle('accessType', value)}
                  compact
                />
              ))}
            </FilterGroup>

            <div className="border-t border-border" />

            <FilterGroup label="Eligibility">
              {ELIGIBILITY_OPTIONS.map(({ value, label }) => (
                <FilterChip
                  key={value}
                  label={label}
                  selected={eligibility.includes(value)}
                  onClick={() => handleEligibilityToggle(value)}
                  compact
                />
              ))}
            </FilterGroup>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-border shrink-0">
            <button
              type="button"
              onClick={onClearFilters}
              className="font-subheader px-4 py-2 rounded-full text-sm text-text-secondary border border-border hover:border-primary hover:text-primary active:scale-[0.96] active:bg-surface-0 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1"
            >
              Clear filters
            </button>
            <button
              type="button"
              onClick={onSearch}
              className="font-subheader px-6 py-2 rounded-full text-sm font-semibold text-text-inverse bg-primary hover:bg-primary-hover active:bg-primary-700 active:scale-[0.96] transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1"
            >
              Search
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
