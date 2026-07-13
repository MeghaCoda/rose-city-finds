import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/app/search/SearchPage', () => ({
  default: () => <div data-testid="search-page" />,
}))

import Page from '@/app/search/page'

describe('search/page', () => {
  it('renders the SearchPage component', () => {
    render(<Page />)
    expect(screen.getByTestId('search-page')).toBeInTheDocument()
  })
})
