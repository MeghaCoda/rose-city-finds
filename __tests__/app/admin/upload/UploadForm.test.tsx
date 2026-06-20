import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UploadForm } from '@/app/admin/upload/UploadForm'

vi.mock('@/app/admin/upload/actions', () => ({
  uploadOffers: vi.fn(),
  getOffers: vi.fn().mockResolvedValue([]),
  getOfferWithLocations: vi.fn(),
  updateOffer: vi.fn(),
}))

const ADMIN_ID = 'admin-123'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('UploadForm', () => {
  it('shows the mode picker on initial render', () => {
    render(<UploadForm adminUserId={ADMIN_ID} />)
    expect(screen.getByText('Upload new data')).toBeInTheDocument()
    expect(screen.getByText('Modify existing data')).toBeInTheDocument()
  })

  it('navigates to the upload panel when "Upload new data" is clicked', () => {
    render(<UploadForm adminUserId={ADMIN_ID} />)
    fireEvent.click(screen.getByText('Upload new data'))
    expect(screen.getByText('Upload new offers')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /single entry/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /csv upload/i })).toBeInTheDocument()
  })

  it('shows the single entry form by default in the upload panel', () => {
    render(<UploadForm adminUserId={ADMIN_ID} />)
    fireEvent.click(screen.getByText('Upload new data'))
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
  })

  it('switches to the CSV section when "CSV upload" tab is clicked', () => {
    render(<UploadForm adminUserId={ADMIN_ID} />)
    fireEvent.click(screen.getByText('Upload new data'))
    fireEvent.click(screen.getByRole('button', { name: /csv upload/i }))
    expect(screen.getByLabelText('CSV File')).toBeInTheDocument()
    expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument()
  })

  it('switches back to single entry when "Single entry" tab is clicked', () => {
    render(<UploadForm adminUserId={ADMIN_ID} />)
    fireEvent.click(screen.getByText('Upload new data'))
    fireEvent.click(screen.getByRole('button', { name: /csv upload/i }))
    fireEvent.click(screen.getByRole('button', { name: /single entry/i }))
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.queryByLabelText('CSV File')).not.toBeInTheDocument()
  })

  it('returns to the mode picker when the back button is clicked', () => {
    render(<UploadForm adminUserId={ADMIN_ID} />)
    fireEvent.click(screen.getByText('Upload new data'))
    fireEvent.click(screen.getByText('← Back'))
    expect(screen.getByText('Upload new data')).toBeInTheDocument()
    expect(screen.getByText('Modify existing data')).toBeInTheDocument()
  })

  it('navigates to the modify panel when "Modify existing data" is clicked', async () => {
    render(<UploadForm adminUserId={ADMIN_ID} />)
    fireEvent.click(screen.getByText('Modify existing data'))
    expect(screen.getByText('Modify existing offer')).toBeInTheDocument()
    expect(await screen.findByLabelText('Select an offer')).toBeInTheDocument()
  })
})
