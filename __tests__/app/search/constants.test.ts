import { describe, it, expect } from 'vitest'
import {
  QUICK_ACTION_TITLE,
  QUICK_ACTION_SUBTITLE,
  FILTERS_HEADER,
  ANYONE_LABEL,
  SUBMIT_LABEL,
  SUBMIT_SUFFIX,
  FILTER_SECTION_LABELS,
} from '@/app/search/constants'

describe('search/constants', () => {
  it('exports non-empty string constants', () => {
    expect(QUICK_ACTION_TITLE).toBeTruthy()
    expect(QUICK_ACTION_SUBTITLE).toBeTruthy()
    expect(FILTERS_HEADER).toBeTruthy()
    expect(ANYONE_LABEL).toBeTruthy()
    expect(SUBMIT_LABEL).toBeTruthy()
    expect(SUBMIT_SUFFIX).toBeTruthy()
  })

  it('exports the four filter section labels', () => {
    expect(FILTER_SECTION_LABELS).toEqual({
      PRICE: 'Price',
      FOOD_TYPE: 'Food Type',
      HOW_YOU_GET_IT: 'How You Get It',
      ELIGIBILITY: 'Eligibility',
    })
  })
})
