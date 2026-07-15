import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
