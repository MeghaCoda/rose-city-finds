import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OfferEntryForm } from '@/app/admin/upload/OfferEntryForm'

vi.mock('@/app/admin/upload/BusinessCombobox', () => ({
  BusinessCombobox: ({
    onSelectExisting,
    onCreateNew,
  }: {
    onSelectExisting: (b: { id: string; name: string }) => void
    onCreateNew: (name: string) => void
  }) => (
    <div>
      <button onClick={() => onSelectExisting({ id: 'biz-1', name: 'Oregon Food Bank' })}>
        Select existing business
      </button>
      <button onClick={() => onCreateNew('New Business')}>Create new business</button>
    </div>
  ),
}))

vi.mock('@/app/admin/upload/actions', () => ({
  submitOfferEntry: vi.fn(),
  getBusinessDetail: vi.fn(),
}))

import { submitOfferEntry, getBusinessDetail } from '@/app/admin/upload/actions'

const ADMIN_ID = 'admin-123'

const BUSINESS_DETAIL = {
  locations: [
    { id: 'loc-1', address: '123 Main St', address2: null, city: 'Portland', state: 'OR', zip_code: '97201' },
  ],
  offers: [{ id: 'offer-1', name: 'Existing Offer' }],
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('OfferEntryForm', () => {
  it('renders the business search step and a disabled submit button', () => {
    render(<OfferEntryForm adminUserId={ADMIN_ID} />)
    expect(screen.getByText('Select existing business')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled()
  })

  it('selecting an existing business loads its locations and offers', async () => {
    vi.mocked(getBusinessDetail).mockResolvedValue(BUSINESS_DETAIL)
    render(<OfferEntryForm adminUserId={ADMIN_ID} />)

    fireEvent.click(screen.getByText('Select existing business'))

    expect(await screen.findByText('123 Main St, Portland, OR 97201')).toBeInTheDocument()
    expect(screen.getByText('+ Add a new location')).toBeInTheDocument()
    expect(screen.getByText('No location for this offer')).toBeInTheDocument()
  })

  it('creating a new business reveals the business detail fields', () => {
    render(<OfferEntryForm adminUserId={ADMIN_ID} />)
    fireEvent.click(screen.getByText('Create new business'))
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByLabelText('Venue Type')).toBeInTheDocument()
  })

  it('hides the existing-offer options once "no location" is chosen', async () => {
    vi.mocked(getBusinessDetail).mockResolvedValue(BUSINESS_DETAIL)
    render(<OfferEntryForm adminUserId={ADMIN_ID} />)

    fireEvent.click(screen.getByText('Select existing business'))
    await screen.findByText('123 Main St, Portland, OR 97201')
    fireEvent.click(screen.getByText('123 Main St, Portland, OR 97201'))

    expect(await screen.findByText('Existing Offer')).toBeInTheDocument()

    fireEvent.click(screen.getByText('No location for this offer'))

    expect(screen.queryByText('Existing Offer')).not.toBeInTheDocument()
    expect(screen.getByText('+ Add a new offer')).toBeInTheDocument()
  })

  it('submits a new business, no location, and a new offer with the correct shape', async () => {
    vi.mocked(submitOfferEntry).mockResolvedValue({
      success: true,
      businessId: 'biz-2',
      locationId: null,
      offerId: 'offer-2',
    })
    render(<OfferEntryForm adminUserId={ADMIN_ID} />)

    fireEvent.click(screen.getByText('Create new business'))
    fireEvent.click(screen.getByText('No location for this offer'))
    fireEvent.click(screen.getByText('+ Add a new offer'))
    fireEvent.change(screen.getByLabelText(/offer name/i), { target: { value: 'Free Groceries' } })

    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => expect(submitOfferEntry).toHaveBeenCalledOnce())
    expect(submitOfferEntry).toHaveBeenCalledWith(
      {
        business: expect.objectContaining({ mode: 'new', name: 'New Business' }),
        location: { mode: 'none' },
        offer: expect.objectContaining({ mode: 'new', name: 'Free Groceries' }),
      },
      ADMIN_ID,
    )
  })

  it('shows an error message and preserves the form on failure', async () => {
    vi.mocked(submitOfferEntry).mockResolvedValue({ success: false, error: 'Database connection failed' })
    render(<OfferEntryForm adminUserId={ADMIN_ID} />)

    fireEvent.click(screen.getByText('Create new business'))
    fireEvent.click(screen.getByText('No location for this offer'))
    fireEvent.click(screen.getByText('+ Add a new offer'))
    fireEvent.change(screen.getByLabelText(/offer name/i), { target: { value: 'Free Groceries' } })
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    expect(await screen.findByText('Database connection failed')).toBeInTheDocument()
    expect(screen.getByLabelText(/offer name/i)).toHaveValue('Free Groceries')
  })
})
