'use client'

import { cn } from '@/lib/utils'

interface CtaBarProps {
  label: string
  sublabel?: string
  onClick: () => void
  className?: string
}

export function CtaBar({ label, sublabel, onClick, className }: CtaBarProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full bg-primary rounded-xl px-6 py-5 flex items-center gap-3 cursor-pointer hover:bg-primary-hover active:bg-primary-700 active:scale-[0.99] transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50',
        className
      )}
    >
      <span
        className="shrink-0 w-5 h-5 rounded-[3px] border-2 border-text-inverse"
        aria-hidden
      />
      <span className="flex items-baseline gap-1.5">
        <span className="text-base font-bold text-text-inverse">{label}</span>
        {sublabel && (
          <span className="text-sm font-normal text-text-inverse/80">{sublabel}</span>
        )}
      </span>
    </button>
  )
}
