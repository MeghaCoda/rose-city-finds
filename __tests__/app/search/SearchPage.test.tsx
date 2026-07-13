import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const mockPush = vi.fn()
const mockReplace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  usePathname: () => '/search',
}))

import SearchPage from '@/app/search/SearchPage'
import { useSearchFilters } from '@/stores/searchFilters.store'
import { FILTERS_HEADER, SUBMIT_LABEL } from '@/app/search/constants'

beforeEach(() => {
  vi.clearAllMocks()
  useSearchFilters.getState().reset()
})

describe('SearchPage', () => {
  it('renders the filters header', () => {
    render(<SearchPage />)
    expect(screen.getByText(FILTERS_HEADER)).toBeInTheDocument()
  })

  it('renders the store defaults as selected chips', () => {
    render(<SearchPage />)
    expect(screen.getByRole('button', { name: 'Free' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Prepared' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Pickup' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('non-default chips render as unselected', () => {
    render(<SearchPage />)
    expect(screen.getByRole('button', { name: 'Discount' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Delivery' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('clicking a price chip toggles it in the store and syncs the URL', () => {
    render(<SearchPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Discount' }))
    expect(useSearchFilters.getState().price).toContain('discount')
    expect(mockReplace).toHaveBeenCalledTimes(1)
    const call = mockReplace.mock.calls[0][0] as string
    expect(call).toContain('/search?')
    expect(new URLSearchParams(call.split('?')[1]).get('price')?.split(',')).toEqual(
      expect.arrayContaining(['free', 'discount'])
    )
  })

  it('clicking a selected chip deselects it', () => {
    render(<SearchPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Free' }))
    expect(useSearchFilters.getState().price).not.toContain('free')
  })

  it('renders the "anyone" eligibility row as checked by default', () => {
    render(<SearchPage />)
    expect(screen.getByRole('checkbox', { name: /anyone/i })).toHaveAttribute('aria-checked', 'true')
  })

  it('clicking a specific eligibility option deselects "anyone"', () => {
    render(<SearchPage />)
    fireEvent.click(screen.getByRole('checkbox', { name: /seniors/i }))
    const state = useSearchFilters.getState()
    expect(state.eligibility).not.toContain('anyone')
    expect(state.eligibility).toContain('seniors')
    expect(mockReplace).toHaveBeenCalled()
  })

  it('clicking "anyone" toggles it directly', () => {
    render(<SearchPage />)
    fireEvent.click(screen.getByRole('checkbox', { name: /anyone/i }))
    expect(useSearchFilters.getState().eligibility).not.toContain('anyone')
  })

  it('submitting pushes to /results with the current filter params', () => {
    render(<SearchPage />)
    fireEvent.click(screen.getByRole('button', { name: new RegExp(SUBMIT_LABEL, 'i') }))
    expect(mockPush).toHaveBeenCalledTimes(1)
    const call = mockPush.mock.calls[0][0] as string
    expect(call).toContain('/results?')
    const params = new URLSearchParams(call.split('?')[1])
    expect(params.get('price')?.split(',')).toEqual(expect.arrayContaining(['free']))
    expect(params.get('eligibility')?.split(',')).toEqual(expect.arrayContaining(['anyone']))
  })
})
