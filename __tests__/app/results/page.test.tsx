import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/app/results/ResultsPage', () => ({
  ResultsPage: () => <div data-testid="results-page" />,
}))

import Page from '@/app/results/page'

describe('results/page', () => {
  it('renders the ResultsPage component', () => {
    render(<Page />)
    expect(screen.getByTestId('results-page')).toBeInTheDocument()
  })
})
