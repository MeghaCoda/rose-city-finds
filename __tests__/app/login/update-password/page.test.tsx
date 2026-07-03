import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/app/login/update-password/UpdatePasswordPage', () => ({
  UpdatePasswordPage: () => <div data-testid="update-password-page" />,
}))

import Page from '@/app/login/update-password/page'

describe('update-password/page', () => {
  it('renders the UpdatePasswordPage component', () => {
    render(<Page />)
    expect(screen.getByTestId('update-password-page')).toBeInTheDocument()
  })
})
