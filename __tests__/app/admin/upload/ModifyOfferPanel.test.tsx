import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ModifyOfferPanel } from '@/app/admin/upload/ModifyOfferPanel'

vi.mock('@/app/admin/upload/actions', () => ({
  getOffers: vi.fn(),
  getOfferWithLocations: vi.fn(),
  updateOffer: vi.fn(),
}))

import { getOffers, getOfferWithLocations, updateOffer } from '@/app/admin/upload/actions'

const MOCK_OFFERS = [
  { id: 'offer-1', name: 'Oregon Food Bank' },
  { id: 'offer-2', name: 'Community Fridge' },
]

const MOCK_DETAIL = {
  id: 'offer-1',
  name: 'Oregon Food Bank',
  description: 'Statewide food bank',
  offer_desc: null,
  offer_source: null,
  benefits: ['free_food'],
  verification_status: 'pending',
  expires_at: null,
  is_active: true,
  notes: null,
  locations: [],
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getOffers).mockResolvedValue(MOCK_OFFERS)
})

describe('ModifyOfferPanel', () => {
  it('shows a loading state then renders the offer list', async () => {
    render(<ModifyOfferPanel onBack={vi.fn()} />)
    expect(screen.getByText(/loading offers/i)).toBeInTheDocument()
    expect(await screen.findByRole('option', { name: 'Oregon Food Bank' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Community Fridge' })).toBeInTheDocument()
  })

  it('loads offer detail when an offer is selected', async () => {
    vi.mocked(getOfferWithLocations).mockResolvedValue(MOCK_DETAIL)
    render(<ModifyOfferPanel onBack={vi.fn()} />)

    const select = await screen.findByLabelText('Select an offer')
    fireEvent.change(select, { target: { value: 'offer-1' } })

    expect(await screen.findByDisplayValue('Oregon Food Bank')).toBeInTheDocument()
    expect(getOfferWithLocations).toHaveBeenCalledWith('offer-1')
  })

  it('shows "no locations" when the loaded offer has none', async () => {
    vi.mocked(getOfferWithLocations).mockResolvedValue(MOCK_DETAIL)
    render(<ModifyOfferPanel onBack={vi.fn()} />)

    fireEvent.change(await screen.findByLabelText('Select an offer'), { target: { value: 'offer-1' } })

    expect(await screen.findByText(/no locations associated/i)).toBeInTheDocument()
  })

  it('calls updateOffer with the offer id and current field values when Save Changes is clicked', async () => {
    vi.mocked(getOfferWithLocations).mockResolvedValue(MOCK_DETAIL)
    vi.mocked(updateOffer).mockResolvedValue({ success: true })
    render(<ModifyOfferPanel onBack={vi.fn()} />)

    fireEvent.change(await screen.findByLabelText('Select an offer'), { target: { value: 'offer-1' } })
    fireEvent.click(await screen.findByRole('button', { name: /save changes/i }))

    await waitFor(() => expect(updateOffer).toHaveBeenCalledOnce())
    expect(updateOffer).toHaveBeenCalledWith('offer-1', expect.objectContaining({ name: 'Oregon Food Bank' }))
  })

  it('shows a success message after saving', async () => {
    vi.mocked(getOfferWithLocations).mockResolvedValue(MOCK_DETAIL)
    vi.mocked(updateOffer).mockResolvedValue({ success: true })
    render(<ModifyOfferPanel onBack={vi.fn()} />)

    fireEvent.change(await screen.findByLabelText('Select an offer'), { target: { value: 'offer-1' } })
    await screen.findByDisplayValue('Oregon Food Bank')
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    expect(await screen.findByText(/offer updated successfully/i)).toBeInTheDocument()
  })

  it('shows an error message when save fails', async () => {
    vi.mocked(getOfferWithLocations).mockResolvedValue(MOCK_DETAIL)
    vi.mocked(updateOffer).mockResolvedValue({ error: 'Permission denied' })
    render(<ModifyOfferPanel onBack={vi.fn()} />)

    fireEvent.change(await screen.findByLabelText('Select an offer'), { target: { value: 'offer-1' } })
    await screen.findByDisplayValue('Oregon Food Bank')
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    expect(await screen.findByText('Permission denied')).toBeInTheDocument()
  })

  it('calls onBack when the back button is clicked', async () => {
    const onBack = vi.fn()
    render(<ModifyOfferPanel onBack={onBack} />)
    await screen.findByLabelText('Select an offer')
    fireEvent.click(screen.getByText('← Back'))
    expect(onBack).toHaveBeenCalledOnce()
  })
})
