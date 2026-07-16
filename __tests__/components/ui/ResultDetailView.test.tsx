import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResultDetailView } from '@/components/ui/ResultDetailView'
import type { LocationWithOffers } from '@/schemas/zodSchema'

type Offer = LocationWithOffers['offers'][number]

function makeOffer(opts: Partial<Offer> = {}): Offer {
  return {
    id: 'offer-1',
    business_id: 'biz-1',
    name: 'Free Groceries',
    description: null,
    price_type: ['free'],
    eligibility: ['anyone'],
    proof_required: false,
    proof_desc: null,
    expires_at: null,
    is_seasonal: false,
    season_start_date: null,
    season_end_date: null,
    is_active: true,
    verification_status: 'verified',
    notes: null,
    hours_notes: null,
    offer_hours: [],
    ...opts,
  }
}

function makeLocation(opts: Partial<LocationWithOffers> = {}): LocationWithOffers {
  return {
    id: 'loc-1',
    business_id: 'biz-1',
    address: '100 SE Test Ave',
    address2: null,
    city: 'Portland',
    state: 'OR',
    zip_code: '97201',
    neighborhood: 'Test District',
    latitude: 45.523,
    longitude: -122.676,
    phone_number: '(503) 555-0000',
    food_formats: ['pickup'],
    verification_status: 'verified',
    notes: null,
    hours_notes: null,
    location_hours: [],
    business: {
      id: 'biz-1',
      name: 'Test Pantry',
      description: 'A test description.',
      venue_type: 'food_pantry',
      verification_status: 'verified',
      is_active: true,
      notes: null,
    },
    offers: [makeOffer()],
    ...opts,
  }
}

describe('ResultDetailView', () => {
  it('renders the business name and description', () => {
    render(<ResultDetailView location={makeLocation()} onBack={() => {}} />)
    expect(screen.getByText('Test Pantry')).toBeInTheDocument()
    expect(screen.getByText('A test description.')).toBeInTheDocument()
  })

  it('renders the address', () => {
    render(<ResultDetailView location={makeLocation()} onBack={() => {}} />)
    expect(screen.getByText('100 SE Test Ave')).toBeInTheDocument()
    expect(screen.getByText('Portland, OR 97201')).toBeInTheDocument()
  })

  it('renders address2 when present', () => {
    render(<ResultDetailView location={makeLocation({ address2: 'Suite 200' })} onBack={() => {}} />)
    expect(screen.getByText('100 SE Test Ave, Suite 200')).toBeInTheDocument()
  })

  it('renders the venue type label', () => {
    render(<ResultDetailView location={makeLocation()} onBack={() => {}} />)
    expect(screen.getByText('Food Pantry')).toBeInTheDocument()
  })

  it('renders offer name and price/eligibility badges', () => {
    render(<ResultDetailView location={makeLocation()} onBack={() => {}} />)
    expect(screen.getByText('Free Groceries')).toBeInTheDocument()
    expect(screen.getByText('Free')).toBeInTheDocument()
    expect(screen.getByText('Anyone')).toBeInTheDocument()
  })

  it('does not render an inactive offer', () => {
    render(
      <ResultDetailView
        location={makeLocation({ offers: [makeOffer({ is_active: false })] })}
        onBack={() => {}}
      />
    )
    expect(screen.queryByText('Free Groceries')).not.toBeInTheDocument()
  })

  it('does not render an expired offer', () => {
    render(
      <ResultDetailView
        location={makeLocation({ offers: [makeOffer({ expires_at: '2000-01-01' })] })}
        onBack={() => {}}
      />
    )
    expect(screen.queryByText('Free Groceries')).not.toBeInTheDocument()
  })

  it('renders proof_required text with proof_desc', () => {
    render(
      <ResultDetailView
        location={makeLocation({ offers: [makeOffer({ proof_required: true, proof_desc: 'Photo ID' })] })}
        onBack={() => {}}
      />
    )
    expect(screen.getByText('Proof required: Photo ID')).toBeInTheDocument()
  })

  it('renders location hours sorted by day', () => {
    render(
      <ResultDetailView
        location={makeLocation({
          location_hours: [
            { day: 'wednesday', opens_at: '09:00', closes_at: '17:00' },
            { day: 'monday', opens_at: '09:00', closes_at: '17:00' },
          ],
        })}
        onBack={() => {}}
      />
    )
    const days = screen.getAllByText(/Monday|Wednesday/)
    expect(days[0]).toHaveTextContent('Monday')
    expect(days[1]).toHaveTextContent('Wednesday')
    expect(screen.getAllByText('9:00 AM').length).toBe(2)
    expect(screen.getAllByText('5:00 PM').length).toBe(2)
  })

  it('renders hours notes once, below the hours list, not per day', () => {
    render(
      <ResultDetailView
        location={makeLocation({
          location_hours: [
            { day: 'wednesday', opens_at: '09:00', closes_at: '17:00' },
            { day: 'monday', opens_at: '09:00', closes_at: '17:00' },
          ],
          hours_notes: 'Closed on holidays',
        })}
        onBack={() => {}}
      />
    )
    const notes = screen.getAllByText('Closed on holidays')
    expect(notes).toHaveLength(1)
  })

  it('calls onBack when the back button is clicked', () => {
    const onBack = vi.fn()
    render(<ResultDetailView location={makeLocation()} onBack={onBack} />)
    screen.getByRole('button', { name: /back to list/i }).click()
    expect(onBack).toHaveBeenCalledTimes(1)
  })
})
