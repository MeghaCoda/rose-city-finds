import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LocationDetails from '@/components/LocationDetails/LocationDetails'
import { mockLocation } from '@/__mocks__/mockData'

describe('LocationDetails', () => {
  it('renders the location name', () => {
    render(<LocationDetails item={mockLocation} />)
    expect(screen.getByRole('heading', { name: 'Test Food Bank' })).toBeInTheDocument()
  })

  it('renders the address', () => {
    render(<LocationDetails item={mockLocation} />)
    expect(screen.getByText('123 Main St')).toBeInTheDocument()
  })

  it('renders city, state and zip together', () => {
    render(<LocationDetails item={mockLocation} />)
    expect(screen.getByText('Portland, OR 97201')).toBeInTheDocument()
  })

  it('renders phone number', () => {
    render(<LocationDetails item={mockLocation} />)
    expect(screen.getByText(/503-555-1234/)).toBeInTheDocument()
  })

  it('renders offer description', () => {
    render(<LocationDetails item={mockLocation} />)
    expect(screen.getByText(/Free meals for families/)).toBeInTheDocument()
  })

  it('renders "no" for delivery when deliveryAvailable is false', () => {
    render(<LocationDetails item={mockLocation} />)
    expect(screen.getByText(/Delivery Available\? no/i)).toBeInTheDocument()
  })

  it('renders "yes" for delivery when deliveryAvailable is true', () => {
    render(<LocationDetails item={{ ...mockLocation, deliveryAvailable: true }} />)
    expect(screen.getByText(/Delivery Available\? yes/i)).toBeInTheDocument()
  })

  it('renders address2 when provided', () => {
    render(<LocationDetails item={{ ...mockLocation, address2: 'Suite 200' }} />)
    expect(screen.getByText('Suite 200')).toBeInTheDocument()
  })

  it('does not render address2 element when not provided', () => {
    render(<LocationDetails item={mockLocation} />)
    expect(screen.queryByText('Suite 200')).not.toBeInTheDocument()
  })

  it('renders donation link when provided', () => {
    render(<LocationDetails item={{ ...mockLocation, donationLink: 'https://donate.example.com' }} />)
    expect(screen.getByText(/Donation Link/)).toBeInTheDocument()
  })

  it('does not render donation link section when not provided', () => {
    render(<LocationDetails item={mockLocation} />)
    expect(screen.queryByText(/Donation Link/)).not.toBeInTheDocument()
  })

  it('renders volunteer link when provided', () => {
    render(<LocationDetails item={{ ...mockLocation, volunteerLink: 'https://volunteer.example.com' }} />)
    expect(screen.getByText(/Volunteer Link/)).toBeInTheDocument()
  })

  it('does not render volunteer link section when not provided', () => {
    render(<LocationDetails item={mockLocation} />)
    expect(screen.queryByText(/Volunteer Link/)).not.toBeInTheDocument()
  })

  it('renders info last verified date', () => {
    render(<LocationDetails item={mockLocation} />)
    expect(screen.getByText('Offer last verified: 2025-01-01')).toBeInTheDocument()
  })

  it('renders last updated date', () => {
    render(<LocationDetails item={mockLocation} />)
    expect(screen.getByText('Info last updated: 2025-01-01')).toBeInTheDocument()
  })
})
