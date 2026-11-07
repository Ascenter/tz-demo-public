import { describe, expect, it } from 'vitest'
import { formatTZS, formatNumber, formatFeedAmount, groupDigits, formatPhone, formatDateTime, parseAmount } from '../../src/engine/format'

describe('formatTZS (parent BR-14)', () => {
  it('puts the currency code first, comma thousands, no decimals', () => {
    expect(formatTZS(250000)).toBe('TZS 250,000')
    expect(formatTZS(5_000_000)).toBe('TZS 5,000,000')
    expect(formatTZS(1000)).toBe('TZS 1,000')
    expect(formatTZS(999)).toBe('TZS 999')
    expect(formatTZS(0)).toBe('TZS 0')
  })
  it('rounds away decimals', () => {
    expect(formatTZS(1234.56)).toBe('TZS 1,235')
  })
})

describe('feed amounts', () => {
  it('shows bare outgoing and +incoming', () => {
    expect(formatNumber(103500)).toBe('103,500')
    expect(formatFeedAmount(20000, 'out')).toBe('20,000')
    expect(formatFeedAmount(150000, 'in')).toBe('+150,000')
  })
})

describe('digit helpers', () => {
  it('groups control number 4-4-4 and meter 4-4-3', () => {
    expect(groupDigits('991081123890', [4, 4, 4])).toBe('9910 8112 3890')
    expect(groupDigits('01234567890', [4, 4, 3])).toBe('0123 4567 890')
    expect(groupDigits('99108', [4, 4, 4])).toBe('9910 8')
  })
  it('formats Tanzanian phones', () => {
    expect(formatPhone('0754318902')).toBe('+255 754 318 902')
    expect(formatPhone('+255754318902')).toBe('+255 754 318 902')
  })
  it('formats receipt dates', () => {
    expect(formatDateTime(new Date(2026, 9, 31, 12, 5))).toBe('12:05, 31.10.2026')
  })
  it('parses typed amounts', () => {
    expect(parseAmount('')).toBe(0)
    expect(parseAmount('25000')).toBe(25000)
  })
})
