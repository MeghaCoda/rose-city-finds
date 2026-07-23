import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

import { Header } from '@/components/Header/Header'

describe('Header', () => {
  it('renders the app title', () => {
    render(<Header />)
    expect(screen.getByText('Rose City Finds')).toBeInTheDocument()
  })

  it('links the title to the home page', () => {
    render(<Header />)
    expect(screen.getByRole('link', { name: /Rose City Finds/ })).toHaveAttribute('href', '/')
  })

  it('shows an About link on the right side', () => {
    render(<Header />)
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about')
  })
})
