import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { Providers } from '@/app/providers'

vi.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => null,
}))

function ClientProbe() {
  const client = useQueryClient()
  return <div data-testid="probe">{client ? 'has-client' : 'no-client'}</div>
}

function QueryProbe() {
  const { data } = useQuery({ queryKey: ['probe'], queryFn: () => Promise.resolve('ok') })
  return <div data-testid="query-probe">{data ?? 'loading'}</div>
}

describe('Providers', () => {
  it('renders its children', () => {
    render(
      <Providers>
        <div data-testid="child" />
      </Providers>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('supplies a QueryClient via context', () => {
    render(
      <Providers>
        <ClientProbe />
      </Providers>
    )
    expect(screen.getByTestId('probe')).toHaveTextContent('has-client')
  })

  it('lets descendants run react-query queries', async () => {
    render(
      <Providers>
        <QueryProbe />
      </Providers>
    )
    expect(await screen.findByText('ok')).toBeInTheDocument()
  })
})
