import { describe, expect, it } from 'vitest'
import { validateAmount } from '../../src/engine/validate'

describe('validateAmount (parent BR-05: min → max → balance)', () => {
  const rules = { min: 1_000, max: 5_000_000, available: 950_000 }
  it('below the minimum (incl. empty) disables silently', () => {
    expect(validateAmount(0, rules)).toBe('below_min')
    expect(validateAmount(999, rules)).toBe('below_min')
  })
  it('accepts the bounds', () => {
    expect(validateAmount(1_000, rules)).toBe('ok')
    expect(validateAmount(950_000, rules)).toBe('ok')
  })
  it('checks the maximum before the balance', () => {
    expect(validateAmount(6_000_000, rules)).toBe('over_max')
  })
  it('then the balance', () => {
    expect(validateAmount(1_000_000, rules)).toBe('over_balance')
  })
  it('skips the balance for money coming in', () => {
    expect(validateAmount(1_000_000, { min: 1_000, max: 5_000_000 })).toBe('ok')
    expect(validateAmount(5_000_001, { min: 1_000, max: 5_000_000 })).toBe('over_max')
  })
  it('flow maximums: airtime 500,000, bills 1,000,000', () => {
    expect(validateAmount(600_000, { min: 1_000, max: 500_000, available: 900_000 })).toBe('over_max')
    expect(validateAmount(1_500_000, { min: 1_000, max: 1_000_000, available: 695_000 })).toBe('over_max')
    expect(validateAmount(900_000, { min: 1_000, max: 1_000_000, available: 695_000 })).toBe('over_balance')
  })
})
