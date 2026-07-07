import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '@/app/page'
import { HOME_COMING_SOON_TITLE, HOME_COMING_SOON_DESCRIPTION } from '@/app/constants'
import { CONTACT_EMAIL } from '@/lib/constants'

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    <img alt={alt} {...(props as object)} />
  ),
}))

describe('Home page', () => {
  it('renders the coming soon heading', () => {
    render(<Home />)
    expect(screen.getByText(HOME_COMING_SOON_TITLE)).toBeInTheDocument()
  })

  it('renders the coming soon description', () => {
    render(<Home />)
    expect(screen.getByText(HOME_COMING_SOON_DESCRIPTION)).toBeInTheDocument()
  })

  it('renders a mailto link with the contact email', () => {
    render(<Home />)
    const link = screen.getByText(CONTACT_EMAIL)
    expect(link).toHaveAttribute('href', `mailto:${CONTACT_EMAIL}`)
  })
})
