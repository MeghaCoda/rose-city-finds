import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, fireEvent } from '@testing-library/react'

const mockPush = vi.fn()
const mockReplace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  usePathname: () => '/design-system',
}))

import DesignSystemPage from '@/app/design-system/page'
import { useSearchFilters } from '@/stores/searchFilters.store'

beforeEach(() => {
  vi.clearAllMocks()
  useSearchFilters.getState().reset()
})

// The "Interactive demo" FilterChip row and the FilterSection Price/Food type
// demo both reuse chip labels ("Free"/"Discount"/"Prepared"/...) that also
// appear as static, non-interactive examples elsewhere on this reference
// page, so queries below are scoped to a specific container rather than
// matched by label text alone.
function interactiveChipRow() {
  const marker = screen.getByText('Interactive demo')
  return within(marker.nextElementSibling as HTMLElement)
}

describe('DesignSystemPage', () => {
  it('renders without crashing', () => {
    expect(() => render(<DesignSystemPage />)).not.toThrow()
  })

  it('renders the page heading', () => {
    render(<DesignSystemPage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Design System' })).toBeInTheDocument()
  })

  it('renders each reference section', () => {
    render(<DesignSystemPage />)
    for (const title of [
      'Color tokens',
      'Typography',
      'StandardButton',
      'FilterChip',
      'FilterSection',
      'EligibilityCard',
      'CtaBar',
      'TabBar',
      'ResultListItem',
      'StatusBadge',
      'FilterDrawer',
      'Combobox',
      'RadioGroup',
      'Radius scale',
    ]) {
      expect(screen.getByRole('heading', { level: 2, name: title })).toBeInTheDocument()
    }
  })

  it('toggles a chip in the FilterChip interactive demo', () => {
    render(<DesignSystemPage />)
    const row = interactiveChipRow()
    const discount = row.getByRole('button', { name: 'Discount' })
    expect(discount).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(discount)
    expect(discount).toHaveAttribute('aria-pressed', 'true')
  })

  it('deselects an already-selected chip in the interactive demo', () => {
    render(<DesignSystemPage />)
    const row = interactiveChipRow()
    const free = row.getByRole('button', { name: 'Free' })
    expect(free).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(free)
    expect(free).toHaveAttribute('aria-pressed', 'false')
  })

  it('toggles chips within the FilterSection demo', () => {
    render(<DesignSystemPage />)
    const section = screen.getByRole('heading', { level: 2, name: 'FilterSection' }).closest('section')!
    const discount = within(section).getByRole('button', { name: 'Discount' })
    expect(discount).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(discount)
    expect(discount).toHaveAttribute('aria-pressed', 'true')
  })

  it('the EligibilityCard demo starts with "Anyone" selected', () => {
    render(<DesignSystemPage />)
    expect(screen.getByRole('checkbox', { name: /anyone/i })).toHaveAttribute('aria-checked', 'true')
  })

  it('selecting a specific eligibility option in the demo deselects "Anyone"', () => {
    render(<DesignSystemPage />)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Honor system' }))
    expect(screen.getByRole('checkbox', { name: /anyone/i })).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByRole('checkbox', { name: 'Honor system' })).toHaveAttribute('aria-checked', 'true')
  })

  it('re-selecting "Anyone" in the demo toggles it back on', () => {
    render(<DesignSystemPage />)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Honor system' }))
    fireEvent.click(screen.getByRole('checkbox', { name: /anyone/i }))
    expect(screen.getByRole('checkbox', { name: /anyone/i })).toHaveAttribute('aria-checked', 'true')
  })

  it('clicking the CtaBar demo does not throw', () => {
    render(<DesignSystemPage />)
    // Accessible name includes the sublabel text too ("Show me results · list and map").
    expect(() => fireEvent.click(screen.getByRole('button', { name: /show me results/i }))).not.toThrow()
  })

  it('switches the TabBar demo between List and Map', () => {
    render(<DesignSystemPage />)
    expect(screen.getByText('Active tab: list')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('tab', { name: /map/i }))
    expect(screen.getByText('Active tab: map')).toBeInTheDocument()
  })

  it('selects a ResultListItem demo row on click', () => {
    render(<DesignSystemPage />)
    const item = screen.getByText('NE Portland Food Pantry').closest('div')!
    expect(item).not.toHaveClass('bg-accent/20')
    fireEvent.click(item)
    expect(item).toHaveClass('bg-accent/20')
  })

  it('deselects a ResultListItem demo row on a second click', () => {
    render(<DesignSystemPage />)
    const item = screen.getByText('NE Portland Food Pantry').closest('div')!
    fireEvent.click(item)
    fireEvent.click(item)
    expect(item).not.toHaveClass('bg-accent/20')
  })

  it('opens the FilterDrawer demo', () => {
    render(<DesignSystemPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Open filter drawer' }))
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument()
  })

  it('clearing filters from the drawer demo resets the store and syncs the URL', () => {
    render(<DesignSystemPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Open filter drawer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(useSearchFilters.getState().price).toEqual(['free'])
    expect(mockReplace).toHaveBeenCalled()
  })
})
