import { describe, expect, it, vi } from 'vitest'

const mem = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
})

const { useDemo } = await import('../../src/app/store')
const { completeCashWithdrawal } = await import('../../src/flows/cash/complete')
const { available, todayOutSum } = await import('../../src/engine/money')

describe('Cash withdrawal v5: Done completes the withdrawal', () => {
  it('debits once (own funds first) and writes the history entry with details', () => {
    useDemo.getState().jumpToStep(3) // 950,000 available, own funds 290,000
    completeCashWithdrawal(50_000)
    const s = useDemo.getState()
    expect(available(s.ledger)).toBe(900_000)
    expect(s.ledger.ownFunds).toBe(240_000)
    expect(todayOutSum(s.history, Date.now())).toBe(313_500)

    const top = s.history[0]
    expect(top).toMatchObject({ title: 'Cash withdrawal', subtitle: 'Wakala agent, Juma Shop', amount: 50_000, direction: 'out', category: 'cash' })
    expect(top.details?.status).toBe('Cash withdrawn')
    const rows = Object.fromEntries(top.details!.blocks.flat())
    expect(rows).toMatchObject({ Agent: 'Juma Shop', 'Agent ID': '123456 | UmojaSwitch', Fee: 'No fee', Reference: 'CW26110312110719', Location: 'Kariakoo, Dar es Salaam' })
    expect(s.history.filter((o) => o.category === 'cash' && o.dayOffset === undefined)).toHaveLength(1)
  })
})
