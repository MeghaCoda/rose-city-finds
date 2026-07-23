import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AboutPage from '@/app/about/page'

describe('AboutPage', () => {
  it('renders the page heading', () => {
    render(<AboutPage />)
    expect(screen.getByRole('heading', { level: 1, name: 'About' })).toBeInTheDocument()
  })

  it('renders the "About Rose City Finds" section with body text', () => {
    render(<AboutPage />)
    const heading = screen.getByRole('heading', { level: 2, name: 'About Rose City Finds' })
    expect(heading).toBeInTheDocument()
    expect(heading.nextElementSibling?.tagName).toBe('P')
    expect(heading.nextElementSibling?.textContent).not.toHaveLength(0)
  })

  it('renders the "About Meghan" section with body text', () => {
    render(<AboutPage />)
    const heading = screen.getByRole('heading', { level: 2, name: 'About Meghan' })
    expect(heading).toBeInTheDocument()
    expect(heading.nextElementSibling?.tagName).toBe('P')
    expect(heading.nextElementSibling?.textContent).not.toHaveLength(0)
  })
})
