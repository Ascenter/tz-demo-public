import { BARAKA_INTERNAL, BARAKA_LOOKUP_KEYS, type SendRecipient } from '../../mock/recipients'
import { digitsOnly } from '../../engine/format'

export interface SearchResult {
  /** "NEW RECIPIENT" found by phone or account (not saved, not in Recent). */
  newRecipient?: SendRecipient
  contacts: SendRecipient[]
}

/**
 * Scripted recipient search (Send S1, S4, OQ-2 a): 0784 552 019 / +255 784 552 019 / 0150 2345 6789 → Baraka M.;
 * text matching a saved or recent name → that contact; anything else → empty list.
 */
export function searchRecipients(query: string, recent: SendRecipient[], saved: Record<string, string>): SearchResult {
  const q = query.trim()
  if (!q) return { contacts: [] }
  const digits = digitsOnly(q)
  const known = (r: SendRecipient) => recent.some((x) => x.account === r.account) || r.account in saved

  if (digits.length >= 9 && /^[\d\s+()-]+$/.test(q)) {
    if (BARAKA_LOOKUP_KEYS.includes(digits)) {
      const inRecent = recent.find((x) => x.account === BARAKA_INTERNAL.account)
      return known(BARAKA_INTERNAL) ? { contacts: [inRecent ?? BARAKA_INTERNAL] } : { newRecipient: BARAKA_INTERNAL, contacts: [] }
    }
    const byNumber = recent.filter((r) => r.account === digits || digitsOnly(r.phone ?? '').endsWith(digits.slice(-9)))
    return { contacts: byNumber }
  }

  const needle = q.toLowerCase()
  const contacts = recent.filter((r) => (saved[r.account] ?? r.name).toLowerCase().includes(needle))
  return { contacts }
}
