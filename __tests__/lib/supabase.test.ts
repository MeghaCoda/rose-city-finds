import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockClient = { auth: {}, from: vi.fn() }
const mockCookieGet = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockClient),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve({ get: mockCookieGet })),
}))

import { createClient } from '@supabase/supabase-js'
import { createSupabaseClient } from '@/lib/supabase'

beforeEach(() => {
  vi.clearAllMocks()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-publishable-key'
  mockCookieGet.mockReturnValue(undefined)
})

describe('createSupabaseClient', () => {
  it('calls createClient with env vars and no auth header when there is no session', async () => {
    await createSupabaseClient()
    expect(createClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-publishable-key',
      undefined,
    )
  })

  it('returns the Supabase client', async () => {
    const client = await createSupabaseClient()
    expect(client).toBe(mockClient)
  })

  it('forwards the auth_token cookie as a bearer token when present', async () => {
    mockCookieGet.mockReturnValue({ value: 'user-session-token' })

    await createSupabaseClient()

    expect(mockCookieGet).toHaveBeenCalledWith('auth_token')
    expect(createClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-publishable-key',
      { global: { headers: { Authorization: 'Bearer user-session-token' } } },
    )
  })
})
