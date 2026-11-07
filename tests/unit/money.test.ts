import { describe, expect, it } from 'vitest'
import { available, credit, debit, groupByDay, todayOutSum, type Operation } from '../../src/engine/money'
import { SEED_HISTORY, SEED_LEDGER } from '../../src/mock/seed'

const NOW = new Date(2026, 11, 15, 10, 0).getTime()

describe('ledger', () => {
  it('available = own funds + available credit (parent BR-04)', () => {
    expect(available(SEED_LEDGER)).toBe(910_000)
  })
  it('spends own funds first, then credit (parent BR-06)', () => {
    const l = debit(SEED_LEDGER, 300_000)
    expect(l.ownFunds).toBe(0)
    expect(l.creditUsed).toBe(50_000)
    expect(available(l)).toBe(610_000)
  })
  it('refuses to spend above the available balance', () => {
    expect(() => debit(SEED_LEDGER, 910_001)).toThrow()
  })
  it('incoming money repays used credit first, then own funds', () => {
    const l = credit(debit(SEED_LEDGER, 300_000), 100_000)
    expect(l.creditUsed).toBe(0)
    expect(l.ownFunds).toBe(50_000)
  })
})

describe('history (parent BR-17)', () => {
  it('seed Today header is 103,500 and Yesterday 145,000 (incoming not counted)', () => {
    const groups = groupByDay(SEED_HISTORY, NOW)
    expect(groups).toHaveLength(2)
    expect(groups[0].outSum).toBe(103_500)
    expect(groups[1].outSum).toBe(145_000)
    expect(todayOutSum(SEED_HISTORY, NOW)).toBe(103_500)
  })
  it('new operations land on top of Today', () => {
    const op: Operation = { id: 'x', title: 'X', subtitle: '', amount: 5_000, direction: 'out', category: 'qr', at: NOW }
    const groups = groupByDay([op, ...SEED_HISTORY], NOW)
    expect(groups[0].items[0].id).toBe('x')
    expect(groups[0].outSum).toBe(108_500)
  })
  it('incoming operations do not change the header', () => {
    const op: Operation = { id: 'y', title: 'Y', subtitle: '', amount: 50_000, direction: 'in', category: 'topup', at: NOW }
    expect(todayOutSum([op, ...SEED_HISTORY], NOW)).toBe(103_500)
  })
})
