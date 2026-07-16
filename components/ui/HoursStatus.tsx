'use client'

import { cn, formatRelativeDate, getHoursStatus } from '@/lib/utils'
import type { DayOfWeek } from '@/types/utils'

interface HoursStatusProps {
  hours: { day: DayOfWeek; opens_at: string; closes_at: string }[]
  verifiedAt?: string | null
  className?: string
  /** Injectable clock, for deterministic demos/tests. Defaults to the real current time. */
  now?: Date
}

export function HoursStatus({ hours, verifiedAt, className, now }: HoursStatusProps) {
  if (hours.length === 0) return null
  const { isOpen, time } = getHoursStatus(hours, now)

  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <p className="flex items-center gap-1.5 text-sm">
        <span className={cn('w-2 h-2 rounded-full shrink-0', isOpen ? 'bg-success' : 'bg-error')} aria-hidden />
        <span className={isOpen ? 'text-success' : 'text-error'}>{isOpen ? 'Open' : 'Closed'}</span>
        {time && (
          <>
            <span className="text-text-muted">·</span>
            <span className="font-medium text-text-primary">
              {isOpen ? 'Closes' : 'Opens'} {time}
            </span>
          </>
        )}
      </p>
      {verifiedAt && <p className="text-xs text-text-muted">Last verified {formatRelativeDate(verifiedAt)}</p>}
    </div>
  )
}
