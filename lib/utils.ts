import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { DAYS } from "@/lib/constants"
import type { DayOfWeek } from "@/types/utils"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isOfferActive(offer: { is_active: boolean; expires_at?: string | null }): boolean {
  if (!offer.is_active) return false
  if (offer.expires_at && new Date(offer.expires_at).getTime() < Date.now()) return false
  return true
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h < 12 ? 'AM' : 'PM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

export interface HoursStatus {
  isOpen: boolean
  /** Formatted closing time if open, next opening time if closed, null if no hours at all. */
  time: string | null
}

export function getHoursStatus(
  hours: { day: DayOfWeek; opens_at: string; closes_at: string }[],
  now: Date = new Date()
): HoursStatus {
  if (hours.length === 0) return { isOpen: false, time: null }

  const dayIndex = (now.getDay() + 6) % 7 // JS getDay is Sun-first; DAYS is Mon-first
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const openEntry = hours
    .filter((h) => h.day === DAYS[dayIndex])
    .find((h) => h.opens_at <= currentTime && currentTime < h.closes_at)
  if (openEntry) return { isOpen: true, time: formatTime(openEntry.closes_at) }

  // Search forward up to a week for the next opening — later today, or a future day.
  for (let offset = 0; offset < 7; offset++) {
    const day = DAYS[(dayIndex + offset) % 7]
    const next = hours
      .filter((h) => h.day === day && (offset > 0 || h.opens_at > currentTime))
      .sort((a, b) => a.opens_at.localeCompare(b.opens_at))[0]
    if (next) return { isOpen: false, time: formatTime(next.opens_at) }
  }

  return { isOpen: false, time: null }
}

export function formatRelativeDate(dateStr: string): string {
  const diffDays = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 1) return 'today'
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} month${months === 1 ? '' : 's'} ago`
  }
  const years = Math.floor(diffDays / 365)
  return `${years} year${years === 1 ? '' : 's'} ago`
}
