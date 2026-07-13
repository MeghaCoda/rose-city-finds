import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CtaBar } from '@/components/ui/CtaBar'

describe('CtaBar', () => {
  it('renders the label', () => {
    render(<CtaBar label="Show me results" onClick={() => {}} />)
    expect(screen.getByText('Show me results')).toBeInTheDocument()
  })

  it('renders the sublabel when provided', () => {
    render(<CtaBar label="Show me results" sublabel="· list and map" onClick={() => {}} />)
    expect(screen.getByText('· list and map')).toBeInTheDocument()
  })

  it('does not render a sublabel when omitted', () => {
    render(<CtaBar label="Show me results" onClick={() => {}} />)
    expect(screen.queryByText('· list and map')).not.toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<CtaBar label="Show me results" onClick={onClick} />)
    fireEvent.click(screen.getByRole('button', { name: /show me results/i }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
