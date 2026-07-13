import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FilterSection } from '@/components/ui/FilterSection'

describe('FilterSection', () => {
  it('renders the label', () => {
    render(<FilterSection label="Price"><div>content</div></FilterSection>)
    expect(screen.getByText('Price')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <FilterSection label="Price">
        <button type="button">Free</button>
      </FilterSection>
    )
    expect(screen.getByRole('button', { name: 'Free' })).toBeInTheDocument()
  })
})
