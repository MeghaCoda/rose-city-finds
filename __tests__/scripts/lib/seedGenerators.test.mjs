import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { faker } from '@faker-js/faker'
import {
  pickVerificationStatus,
  pastThenUpdated,
  weightedCount,
  buildHoursRows,
  buildVerificationEvent,
} from '../../../scripts/lib/seedGenerators.mjs'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('pickVerificationStatus', () => {
  it('returns "verified" for a low draw', () => {
    vi.spyOn(faker.number, 'float').mockReturnValue(0.1)
    expect(pickVerificationStatus()).toBe('verified')
  })

  it('returns "pending" just above the verified boundary', () => {
    vi.spyOn(faker.number, 'float').mockReturnValue(0.8)
    expect(pickVerificationStatus()).toBe('pending')
  })

  it('returns "rejected" just above the pending boundary', () => {
    vi.spyOn(faker.number, 'float').mockReturnValue(0.95)
    expect(pickVerificationStatus()).toBe('rejected')
  })

  it('returns "delisted" for a high draw', () => {
    vi.spyOn(faker.number, 'float').mockReturnValue(0.99)
    expect(pickVerificationStatus()).toBe('delisted')
  })
})

describe('pastThenUpdated', () => {
  const referenceDate = new Date('2026-06-30T00:00:00Z')

  it('returns two Date instances', () => {
    const [createdAt, updatedAt] = pastThenUpdated(referenceDate)
    expect(createdAt).toBeInstanceOf(Date)
    expect(updatedAt).toBeInstanceOf(Date)
  })

  it('createdAt is before or equal to updatedAt', () => {
    const [createdAt, updatedAt] = pastThenUpdated(referenceDate)
    expect(createdAt.getTime()).toBeLessThanOrEqual(updatedAt.getTime())
  })

  it('updatedAt never exceeds the reference date', () => {
    const [, updatedAt] = pastThenUpdated(referenceDate)
    expect(updatedAt.getTime()).toBeLessThanOrEqual(referenceDate.getTime())
  })

  it('createdAt is within roughly the last 2 years of the reference date', () => {
    const [createdAt] = pastThenUpdated(referenceDate)
    const twoYearsMs = 2 * 366 * 24 * 60 * 60 * 1000
    expect(createdAt.getTime()).toBeGreaterThanOrEqual(referenceDate.getTime() - twoYearsMs)
  })
})

describe('weightedCount', () => {
  it('returns the first bucket whose cumulative weight exceeds the draw', () => {
    vi.spyOn(faker.number, 'float').mockReturnValue(0.5)
    expect(weightedCount([[1, 0.65], [2, 0.25], [3, 0.10]])).toBe(1)
  })

  it('returns the second bucket when the draw lands past the first', () => {
    vi.spyOn(faker.number, 'float').mockReturnValue(0.7)
    expect(weightedCount([[1, 0.65], [2, 0.25], [3, 0.10]])).toBe(2)
  })

  it('returns the third bucket when the draw lands near the top', () => {
    vi.spyOn(faker.number, 'float').mockReturnValue(0.95)
    expect(weightedCount([[1, 0.65], [2, 0.25], [3, 0.10]])).toBe(3)
  })

  it('falls back to the last bucket when weights do not sum to 1', () => {
    vi.spyOn(faker.number, 'float').mockReturnValue(0.99)
    expect(weightedCount([[7, 0.1]])).toBe(7)
  })
})

describe('buildHoursRows', () => {
  const config = {
    referenceDate: new Date('2026-06-30T00:00:00Z'),
    days: ['monday', 'tuesday', 'wednesday'],
    openTimes: ['08:00'],
    closeTimes: ['17:00'],
  }

  beforeEach(() => {
    faker.seed(1)
  })

  it('returns between 2 and the full day count of rows', () => {
    const rows = buildHoursRows('parent-1', config)
    expect(rows.length).toBeGreaterThanOrEqual(2)
    expect(rows.length).toBeLessThanOrEqual(config.days.length)
  })

  it('every row embeds the sql-escaped parent id', () => {
    const rows = buildHoursRows("parent's-id", config)
    for (const row of rows) {
      expect(row).toContain("'parent''s-id'")
    }
  })

  it('every row uses one of the configured open/close times', () => {
    const rows = buildHoursRows('parent-1', config)
    for (const row of rows) {
      expect(row).toContain("'08:00'")
      expect(row).toContain("'17:00'")
    }
  })

  it('every row references one of the configured days', () => {
    const rows = buildHoursRows('parent-1', config)
    for (const row of rows) {
      expect(config.days.some((day) => row.includes(`'${day}'`))).toBe(true)
    }
  })

  it('sets valid_from/valid_until on every row when seasonal', () => {
    vi.spyOn(faker.datatype, 'boolean').mockReturnValueOnce(true).mockReturnValue(false)
    const rows = buildHoursRows('parent-1', config)
    for (const row of rows) {
      // Trailing 2 columns are valid_from, valid_until — neither should be NULL.
      const trailing = row.split(', ').slice(-2).join(', ')
      expect(trailing).not.toBe('NULL, NULL)')
    }
  })

  it('leaves valid_from/valid_until NULL when not seasonal', () => {
    vi.spyOn(faker.datatype, 'boolean').mockReturnValue(false)
    const rows = buildHoursRows('parent-1', config)
    for (const row of rows) {
      const trailing = row.split(', ').slice(-2).join(', ')
      expect(trailing).toBe('NULL, NULL)')
    }
  })
})

describe('buildVerificationEvent', () => {
  const config = { adminIds: ['admin-1', 'admin-2'], verificationMethods: ['phone', 'email'] }
  const statusChangedAt = { at: new Date('2026-05-01T00:00:00Z'), outcome: 'verified' }

  it('places the target id under business_id and NULLs the others', () => {
    const row = buildVerificationEvent('business_id', 'biz-1', statusChangedAt, config)
    expect(row).toContain("'biz-1'")
    // 3 trailing columns are business_id, offer_id, location_id, in that order.
    const trailing = row.split(', ').slice(-3).join(', ')
    expect(trailing).toBe("'biz-1', NULL, NULL)")
  })

  it('places the target id under offer_id and NULLs the others', () => {
    const row = buildVerificationEvent('offer_id', 'offer-1', statusChangedAt, config)
    const trailing = row.split(', ').slice(-3).join(', ')
    expect(trailing).toBe("NULL, 'offer-1', NULL)")
  })

  it('places the target id under location_id and NULLs the others', () => {
    const row = buildVerificationEvent('location_id', 'loc-1', statusChangedAt, config)
    const trailing = row.split(', ').slice(-3).join(', ')
    expect(trailing).toBe("NULL, NULL, 'loc-1')")
  })

  it('includes the sql-escaped outcome and verified_at timestamp', () => {
    const row = buildVerificationEvent('business_id', 'biz-1', statusChangedAt, config)
    expect(row).toContain("'2026-05-01T00:00:00.000Z'")
    expect(row).toContain("'verified'")
  })

  it('draws verified_by and method from the configured pools', () => {
    const row = buildVerificationEvent('business_id', 'biz-1', statusChangedAt, config)
    const hasAdmin = config.adminIds.some((id) => row.includes(`'${id}'`))
    const hasMethod = config.verificationMethods.some((m) => row.includes(`'${m}'`))
    expect(hasAdmin).toBe(true)
    expect(hasMethod).toBe(true)
  })
})
