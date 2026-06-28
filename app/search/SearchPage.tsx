'use client'

import { useRouter } from 'next/navigation'
import { useSearchFilters, type FilterKey } from '@/store/searchFilters'
import { ROUTES } from '@/lib/constants'
import {
  QUICK_ACTION_TITLE,
  QUICK_ACTION_SUBTITLE,
  FILTERS_HEADER,
  ANYONE_LABEL,
  SUBMIT_LABEL,
  SUBMIT_SUFFIX,
  FILTER_SECTION_LABELS,
  TOGGLE_LABELS,
  ELIGIBILITY_OPTIONS,
} from './constants'

function SquareIcon({ filled }: { filled: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 w-4 h-4 rounded-[3px] border-2 ${
        filled ? '' : 'border-text-muted'
      }`}
      aria-hidden
    />
  )
}

function CheckboxIcon({ checked }: { checked: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center w-5 h-5 rounded-[3px] border-2 transition-colors ${
        checked ? 'border-primary bg-primary' : 'border-border bg-surface-1'
      }`}
      aria-hidden
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  )
}

function ToggleButton({
  label,
  selected,
  onClick,
  selectedBg = 'bg-primary border-primary',
  fullWidth = false,
}: {
  label: string
  selected: boolean
  onClick: () => void
  selectedBg?: string
  fullWidth?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-full border text-sm font-medium transition-colors cursor-pointer ${
        fullWidth ? 'flex-1' : ''
      } ${
        selected
          ? selectedBg
          : 'bg-surface-1 border-border text-text-secondary hover:border-primary'
      }`}
    >
      <SquareIcon filled={selected} />
      {label}
    </button>
  )
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-1 rounded-xl border border-border overflow-hidden">
      <p className="px-4 pt-4 pb-2 text-xs font-semibold tracking-widest text-text-muted uppercase">
        {label}
      </p>
      <div className="px-4 pb-4">{children}</div>
    </div>
  )
}

export default function SearchPage() {
  const router = useRouter()
  const { price, foodType, accessType, eligibility, toggle, toParams } = useSearchFilters()

  function handleToggle(key: FilterKey, value: string) {
    toggle(key, value)
  }

  function handleSubmit() {
    const params = toParams()
    router.push(`${ROUTES.MAP}?${params.toString()}`)
  }

  const anyoneSelected = eligibility.includes('anyone')

  function handleEligibilityToggle(value: string) {
    if (value === 'anyone') {
      toggle('eligibility', 'anyone')
      return
    }
    // If "anyone" is selected and user picks a specific option, deselect "anyone"
    if (anyoneSelected) {
      toggle('eligibility', 'anyone')
    }
    toggle('eligibility', value)
  }

  return (
    <div className="flex flex-col min-h-full bg-surface-0">

      {/* Filter body */}
      <div className="flex-1 px-4 pt-6 pb-28 flex flex-col gap-4">
        <p className="text-xs font-semibold tracking-widest text-text-muted uppercase px-1">
          {FILTERS_HEADER}
        </p>

        {/* Price */}
        <FilterSection label={FILTER_SECTION_LABELS.PRICE}>
          <div className="flex gap-3">
            <ToggleButton
              label={TOGGLE_LABELS.FREE}
              selected={price.includes('free')}
              onClick={() => handleToggle('price', 'free')}
              selectedBg="bg-green border-green"
              fullWidth
            />
            <ToggleButton
              label={TOGGLE_LABELS.DISCOUNT}
              selected={price.includes('discount')}
              onClick={() => handleToggle('price', 'discount')}
              fullWidth
            />
          </div>
        </FilterSection>

        {/* Food Type */}
        <FilterSection label={FILTER_SECTION_LABELS.FOOD_TYPE}>
          <div className="flex flex-wrap gap-2">
            <ToggleButton
              label={TOGGLE_LABELS.PREPARED}
              selected={foodType.includes('prepared')}
              onClick={() => handleToggle('foodType', 'prepared')}
            />
            <ToggleButton
              label={TOGGLE_LABELS.GROCERIES}
              selected={foodType.includes('groceries')}
              onClick={() => handleToggle('foodType', 'groceries')}
            />
            <ToggleButton
              label={TOGGLE_LABELS.RESTAURANT}
              selected={foodType.includes('restaurant')}
              onClick={() => handleToggle('foodType', 'restaurant')}
            />
          </div>
        </FilterSection>

        {/* How you get it */}
        <FilterSection label={FILTER_SECTION_LABELS.HOW_YOU_GET_IT}>
          <div className="flex flex-wrap gap-2">
            <ToggleButton
              label={TOGGLE_LABELS.PICKUP}
              selected={accessType.includes('pickup')}
              onClick={() => handleToggle('accessType', 'pickup')}
            />
            <ToggleButton
              label={TOGGLE_LABELS.DELIVERY}
              selected={accessType.includes('delivery')}
              onClick={() => handleToggle('accessType', 'delivery')}
            />
          </div>
        </FilterSection>

        {/* Eligibility */}
        <FilterSection label={FILTER_SECTION_LABELS.ELIGIBILITY}>
          {/* Anyone row */}
          <button
            type="button"
            onClick={() => handleEligibilityToggle('anyone')}
            className="w-full flex items-center gap-3 py-3 border-b border-border cursor-pointer"
          >
            <CheckboxIcon checked={anyoneSelected} />
            <span className="text-sm font-medium text-text-primary">{ANYONE_LABEL}</span>
          </button>

          {/* 2-col grid */}
          <div className="grid grid-cols-2 mt-1">
            {ELIGIBILITY_OPTIONS.map((opt, i) => {
              const isLastOdd = i === ELIGIBILITY_OPTIONS.length - 1 && ELIGIBILITY_OPTIONS.length % 2 !== 0
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleEligibilityToggle(opt.value)}
                  className={`flex items-center gap-3 py-3 cursor-pointer ${
                    i % 2 === 0 && !isLastOdd ? 'border-r border-border pr-4' : 'pl-4'
                  } ${i < ELIGIBILITY_OPTIONS.length - (isLastOdd ? 1 : 2) ? 'border-b border-border' : ''} ${
                    isLastOdd ? 'col-span-2' : ''
                  }`}
                >
                  <CheckboxIcon checked={eligibility.includes(opt.value) && !anyoneSelected} />
                  <span className="text-sm text-text-secondary">{opt.label}</span>
                </button>
              )
            })}
          </div>
        </FilterSection>
      </div>

      {/* Submit */}
      <div className="sticky bottom-0 px-4 pb-6 pt-2 bg-surface-0">
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full bg-primary rounded-xl px-6 py-5 flex items-center justify-center gap-3 font-semibold text-lg cursor-pointer hover:bg-primary/90 transition-colors"
        >
          <span className="flex items-center justify-center w-5 h-5 rounded-[3px] border-2 shrink-0" aria-hidden />
          {SUBMIT_LABEL}
          <span className="text-sm font-normal">{SUBMIT_SUFFIX}</span>
        </button>
      </div>
    </div>
  )
}
