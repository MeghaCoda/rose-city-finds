'use client'

import { Toggle } from '@base-ui/react/toggle'
import { cn } from '@/lib/utils'

interface FilterChipProps {
  label: string
  selected: boolean
  onClick: () => void
  /** Compact variant: no checkbox square, smaller padding. Used in the results bar. */
  compact?: boolean
  fullWidth?: boolean
  /** Override classes for the selected state (defaults to primary) */
  selectedClassName?: string
  /** Override background class for the checkbox when selected — should match the chip's selected background */
  selectedCheckboxClassName?: string
  className?: string
}

export function FilterChip({
  label,
  selected,
  onClick,
  compact = false,
  fullWidth = false,
  selectedClassName = 'bg-primary border-primary text-text-inverse',
  selectedCheckboxClassName = 'bg-transparent',
  className,
}: FilterChipProps) {
  return (
    <Toggle
      data-slot="filter-chip"
      pressed={selected}
      onPressedChange={() => onClick()}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border text-sm font-medium transition-all cursor-pointer select-none active:scale-[0.95] outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1',
        compact ? 'px-3.5 py-1.5' : 'px-4 py-2 group',
        fullWidth && 'flex-1 justify-center',
        selected
          ? cn(selectedClassName, !compact && 'hover:brightness-90 hover:shadow-md')
          : cn('bg-surface-1 border-border text-text-primary hover:border-primary', !compact && 'hover:bg-primary-subtle'),
        className
      )}
    >
      {!compact && (
        <span
          className={cn(
            'inline-flex shrink-0 items-center justify-center w-4 h-4 rounded-[3px] border-[1.5px] transition-colors',
            selected ? cn('border-text-inverse', selectedCheckboxClassName) : 'border-border group-hover:border-primary'
          )}
          aria-hidden
        >
          {selected && (
            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
              <path d="M1 3.5L3 5.5L8 1" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      )}
      {label}
      {compact && (
        <span className={cn('text-sm leading-none', !selected && 'opacity-0')} aria-hidden>✕</span>
      )}
    </Toggle>
  )
}
