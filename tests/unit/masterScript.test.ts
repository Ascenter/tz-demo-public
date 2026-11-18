import { describe, expect, it, vi } from 'vitest'

// The store touches localStorage via persist; a tiny in-memory shim is enough for node.
const mem = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
})

const { dataAfterStep } = await import('../../src/app/store')
const { MASTER_SCRIPT } = await import('../../src/mock/masterScript')
const { available, todayOutSum } = await import('../../src/engine/money')

describe('Jump to step N reproduces the Master demo script table', () => {
  for (const s of MASTER_SCRIPT) {
    it(`step ${s.step} — ${s.flow}`, () => {
      const d = dataAfterStep(s.step)
      expect(available(d.ledger)).toBe(s.expected.available)
      expect(d.ledger.ownFunds).toBe(s.expected.ownFunds)
      expect(d.ledger.creditLimit).toBe(660_000)
      expect(todayOutSum(d.history, Date.now())).toBe(s.expected.today)
    })
  }
  it('after step 2 Recent shows the TIPS recipient on top and Baraka saved', () => {
    const d = dataAfterStep(2)
    expect(d.recent[0].name).toBe('BARAKA JOHN MWAKYUSA')
    expect(d.saved['015023456789']).toBe('Baraka Mwakyusa')
  })
  it('after step 5 Rehema Juma is first in Airtime Recent, in Contacts and on the feed row', () => {
    const d = dataAfterStep(5)
    expect(d.airtimeRecent.map((c) => c.name)).toEqual(['Rehema Juma', 'Neema Mushi', 'Joseph Kimaro'])
    expect(d.airtimeContacts.map((c) => c.name)).toContain('Rehema Juma')
    expect(d.history[0].title).toBe('Rehema Juma')
    expect(d.history[0].subtitle).toBe('Airtime · Vodacom')
  })
})
