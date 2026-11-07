import { OPERATOR_PREFIXES } from '../../mock/operators'
import { digitsOnly, formatPhone } from '../../engine/format'

/**
 * Airtime BR-04: a number is complete at 10 digits from 0, or +255 and 9 digits.
 * Returns the 9 local digits, or null while incomplete.
 */
export function completeLocal(query: string): string | null {
  const q = query.trim()
  const d = digitsOnly(q)
  if (d.startsWith('0') && d.length === 10) return d.slice(1)
  if ((q.startsWith('+255') || d.startsWith('255')) && d.length === 12) return d.slice(3)
  return null
}

/** Operator by prefix (e.g. "754…" → prefix "075" → Vodacom); null = unknown prefix. */
export function operatorOf(phone: string): string | null {
  const d = digitsOnly(phone)
  const local = d.startsWith('255') ? d.slice(3) : d.startsWith('0') ? d.slice(1) : d
  const prefix = `0${local.slice(0, 2)}`
  for (const [op, list] of Object.entries(OPERATOR_PREFIXES)) if (list.includes(prefix)) return op
  return null
}

export const toIntl = (local9: string) => formatPhone(`0${local9}`)
