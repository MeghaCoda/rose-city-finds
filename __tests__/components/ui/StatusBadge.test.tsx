import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from '@/components/ui/StatusBadge'

describe('StatusBadge', () => {
  it('renders the label', () => {
    render(<StatusBadge variant="success" label="Open" />)
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('applies success variant classes', () => {
    render(<StatusBadge variant="success" label="Open" />)
    expect(screen.getByText('Open').closest('span')).toHaveClass('bg-success-subtle', 'text-success')
  })

  it('applies warning variant classes', () => {
    render(<StatusBadge variant="warning" label="Limited" />)
    expect(screen.getByText('Limited').closest('span')).toHaveClass('bg-warning-subtle', 'text-warning')
  })

  it('applies error variant classes', () => {
    render(<StatusBadge variant="error" label="Closed" />)
    expect(screen.getByText('Closed').closest('span')).toHaveClass('bg-error-subtle', 'text-error')
  })
})
