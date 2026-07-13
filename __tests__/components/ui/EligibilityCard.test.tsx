import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EligibilityCard } from '@/components/ui/EligibilityCard'

const OPTIONS = [
  { value: 'seniors', label: 'Seniors (65+)' },
  { value: 'children', label: 'Children' },
]

describe('EligibilityCard', () => {
  it('renders the section label when provided', () => {
    render(
      <EligibilityCard
        sectionLabel="Eligibility"
        anyoneLabel="Anyone — no requirements"
        options={OPTIONS}
        selected={[]}
        anyoneSelected
        onToggle={() => {}}
      />
    )
    expect(screen.getByText('Eligibility')).toBeInTheDocument()
  })

  it('omits the section label when not provided', () => {
    render(
      <EligibilityCard
        anyoneLabel="Anyone — no requirements"
        options={OPTIONS}
        selected={[]}
        anyoneSelected
        onToggle={() => {}}
      />
    )
    expect(screen.queryByText('Eligibility')).not.toBeInTheDocument()
  })

  it('renders the anyone row as checked when anyoneSelected is true', () => {
    render(
      <EligibilityCard
        anyoneLabel="Anyone — no requirements"
        options={OPTIONS}
        selected={[]}
        anyoneSelected
        onToggle={() => {}}
      />
    )
    expect(screen.getByRole('checkbox', { name: /anyone/i })).toHaveAttribute('aria-checked', 'true')
  })

  it('renders the anyone row as unchecked when anyoneSelected is false', () => {
    render(
      <EligibilityCard
        anyoneLabel="Anyone — no requirements"
        options={OPTIONS}
        selected={['seniors']}
        anyoneSelected={false}
        onToggle={() => {}}
      />
    )
    expect(screen.getByRole('checkbox', { name: /anyone/i })).toHaveAttribute('aria-checked', 'false')
  })

  it('renders every option', () => {
    render(
      <EligibilityCard
        anyoneLabel="Anyone — no requirements"
        options={OPTIONS}
        selected={[]}
        anyoneSelected
        onToggle={() => {}}
      />
    )
    expect(screen.getByText('Seniors (65+)')).toBeInTheDocument()
    expect(screen.getByText('Children')).toBeInTheDocument()
  })

  it('marks a selected option as checked when anyone is not selected', () => {
    render(
      <EligibilityCard
        anyoneLabel="Anyone — no requirements"
        options={OPTIONS}
        selected={['seniors']}
        anyoneSelected={false}
        onToggle={() => {}}
      />
    )
    expect(screen.getByRole('checkbox', { name: 'Seniors (65+)' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('checkbox', { name: 'Children' })).toHaveAttribute('aria-checked', 'false')
  })

  it('an option in `selected` shows unchecked while anyone is selected', () => {
    render(
      <EligibilityCard
        anyoneLabel="Anyone — no requirements"
        options={OPTIONS}
        selected={['seniors']}
        anyoneSelected
        onToggle={() => {}}
      />
    )
    expect(screen.getByRole('checkbox', { name: 'Seniors (65+)' })).toHaveAttribute('aria-checked', 'false')
  })

  it('calls onToggle with "anyone" when the anyone row is clicked', () => {
    const onToggle = vi.fn()
    render(
      <EligibilityCard
        anyoneLabel="Anyone — no requirements"
        options={OPTIONS}
        selected={[]}
        anyoneSelected={false}
        onToggle={onToggle}
      />
    )
    screen.getByRole('checkbox', { name: /anyone/i }).click()
    expect(onToggle).toHaveBeenCalledWith('anyone')
  })

  it('calls onToggle with the option value when an option is clicked', () => {
    const onToggle = vi.fn()
    render(
      <EligibilityCard
        anyoneLabel="Anyone — no requirements"
        options={OPTIONS}
        selected={[]}
        anyoneSelected={false}
        onToggle={onToggle}
      />
    )
    screen.getByRole('checkbox', { name: 'Children' }).click()
    expect(onToggle).toHaveBeenCalledWith('children')
  })
})
