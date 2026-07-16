'use client'

import { Fragment } from 'react'
import { IconArrowLeft } from '@tabler/icons-react'
import { cn, formatTime, isOfferActive } from '@/lib/utils'
import { DAYS, DAY_LABELS, VENUE_TYPE_LABELS, PRICE_TYPE_LABELS, ELIGIBILITY_TYPE_LABELS, FOOD_FORMAT_LABELS } from '@/lib/constants'
import { HoursStatus } from '@/components/ui/HoursStatus'
import type { LocationWithOffers } from '@/schemas/zodSchema'

type Hours = LocationWithOffers['location_hours']

interface ResultDetailViewProps {
  location: LocationWithOffers
  onBack: () => void
  className?: string
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', className)}>
      {children}
    </span>
  )
}

function HoursList({ hours, notes }: { hours: Hours; notes?: string | null }) {
  if (hours.length === 0) return null
  const sorted = [...hours].sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day))
  return (
    <div className="flex flex-col gap-1.5">
      {/* Fragments (not <li> wrappers) so each row's cells are direct grid
          children — Safari doesn't size CSS Grid columns correctly when
          they're wrapped in a display:contents element. */}
      <div role="list" className="grid grid-cols-[auto_auto_auto_auto] gap-y-0.5 text-sm text-text-secondary">
        {sorted.map((h) => (
          <Fragment key={h.day}>
            <span role="listitem" className="pr-2 font-medium text-text-primary">{DAY_LABELS[h.day]}</span>
            <span className="text-right tabular-nums">{formatTime(h.opens_at)}</span>
            <span className="text-text-muted mx-auto">–</span>
            <span className="tabular-nums">{formatTime(h.closes_at)}</span>
          </Fragment>
        ))}
      </div>
      {notes && <p className="text-sm text-text-muted">{notes}</p>}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-2">
      {children}
    </p>
  )
}

export function ResultDetailView({ location, onBack, className }: ResultDetailViewProps) {
  const address = [location.address, location.address2].filter(Boolean).join(', ')
  const activeOffers = location.offers.filter(isOfferActive)

  return (
    <div className={cn('flex flex-col gap-6 p-4 overflow-y-auto bg-surface-0', className)}>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50 rounded"
      >
        <IconArrowLeft size={16} stroke={2} aria-hidden />
        Back to list
      </button>

      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold tracking-widest uppercase text-text-muted">
          {VENUE_TYPE_LABELS[location.business.venue_type] ?? location.business.venue_type}
        </p>
        <h2 className="text-lg font-bold text-text-primary">{location.business.name}</h2>
        {location.business.description && (
          <p className="text-sm text-text-secondary mt-1">{location.business.description}</p>
        )}
      </div>

      <div className="flex flex-col gap-1 text-sm text-text-secondary">
        <p>{address}</p>
        <p>
          {location.city}, {location.state} {location.zip_code}
        </p>
        {location.neighborhood && <p>{location.neighborhood}</p>}
        {location.phone_number && <p>{location.phone_number}</p>}
      </div>

      {location.food_formats.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {location.food_formats.map((format) => (
            <Badge key={format} className="bg-surface-1 border border-border text-text-secondary">
              {FOOD_FORMAT_LABELS[format] ?? format}
            </Badge>
          ))}
        </div>
      )}

      {location.location_hours.length > 0 && (
        <div>
          <SectionLabel>Hours</SectionLabel>
          <HoursStatus
            hours={location.location_hours}
            verifiedAt={location.verification_status === 'verified' ? location.verification_status_changed_at : null}
            className="mb-[1lh]"
          />
          <HoursList hours={location.location_hours} notes={location.hours_notes} />
        </div>
      )}

      {activeOffers.length > 0 && (
        <div>
          <SectionLabel>Offers</SectionLabel>
          <div className="flex flex-col gap-3">
            {activeOffers.map((offer) => (
              <div key={offer.id} className="bg-surface-1 rounded-xl border border-border p-4 flex flex-col gap-2">
                <p className="font-semibold text-text-primary">{offer.name}</p>
                {offer.description && <p className="text-sm text-text-secondary">{offer.description}</p>}

                <div className="flex flex-wrap gap-1.5">
                  {offer.price_type.map((pt) => (
                    <Badge key={pt} className="bg-primary-200 text-primary-800">
                      {PRICE_TYPE_LABELS[pt] ?? pt}
                    </Badge>
                  ))}
                  {offer.eligibility.map((el) => (
                    <Badge key={el} className="bg-secondary-200 text-secondary-800">
                      {ELIGIBILITY_TYPE_LABELS[el] ?? el}
                    </Badge>
                  ))}
                </div>

                {offer.proof_required && (
                  <p className="text-xs text-text-muted">
                    Proof required{offer.proof_desc ? `: ${offer.proof_desc}` : ''}
                  </p>
                )}

                {offer.is_seasonal && (offer.season_start_date || offer.season_end_date) && (
                  <p className="text-xs text-text-muted">
                    Seasonal: {offer.season_start_date ?? '?'} – {offer.season_end_date ?? '?'}
                  </p>
                )}

                {offer.expires_at && (
                  <p className="text-xs text-text-muted">Available through {offer.expires_at}</p>
                )}

                {offer.offer_hours.length > 0 && (
                  <HoursList hours={offer.offer_hours} notes={offer.hours_notes} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
