import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SearchBar from '@/components/SearchBar/SearchBar'

describe('SearchBar', () => {
  it('renders a search input', () => {
    render(<SearchBar />)
    expect(screen.getByRole('searchbox')).toBeInTheDocument()
  })

  it('search input has the correct placeholder', () => {
    render(<SearchBar />)
    expect(screen.getByPlaceholderText('Address or Zip Code')).toBeInTheDocument()
  })

  it('renders a Search button', () => {
    render(<SearchBar />)
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })
})
