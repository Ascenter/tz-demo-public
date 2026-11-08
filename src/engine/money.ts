import { startOfDay } from './clock'

export interface Ledger {
  ownFunds: number
  creditLimit: number
  creditUsed: number
}

export type Category =
  | 'transfer'
  | 'topup'
  | 'cash'
  | 'bills'
  | 'water'
  | 'gov'
  | 'card'
  | 'qr'
  | 'airtime'

export interface Operation {
  id: string
  title: string
  subtitle: string
  amount: number
  direction: 'in' | 'out'
  category: Category
  /** Timestamp of a live operation. */
  at: number
  /** Seed rows are dated relative to device time: 0 = today, 1 = yesterday (parent BR-17). */
  dayOffset?: number
  /** Initials avatar instead of a category icon (e.g. "ML" for the QR merchant). */
  initials?: string
  /** Transaction details opened by tapping the row (Cash v5). Rows without details are not tappable. */
  details?: OperationDetails
}

/** Receipt content for a history entry. A value of DATE_TOKEN is replaced by the entry's date. */
export interface OperationDetails {
  status: string
  blocks: [label: string, value: string][][]
}

export const DATE_TOKEN = '{date}'

// parent BR-04: available balance = own funds + available credit.
export function available(l: Ledger): number {
  return l.ownFunds + (l.creditLimit - l.creditUsed)
}

export function availableCredit(l: Ledger): number {
  return l.creditLimit - l.creditUsed
}

// parent BR-06: payments spend own funds first, then credit.
export function debit(l: Ledger, amount: number): Ledger {
  if (amount <= 0) throw new Error('Debit must be positive')
  if (amount > available(l)) throw new Error('Not enough money')
  const fromOwn = Math.min(l.ownFunds, amount)
  return { ...l, ownFunds: l.ownFunds - fromOwn, creditUsed: l.creditUsed + (amount - fromOwn) }
}

// Incoming money first repays used credit, then adds to own funds (see ASSUMPTIONS.md; never reached in the Master script).
export function credit(l: Ledger, amount: number): Ledger {
  if (amount <= 0) throw new Error('Credit must be positive')
  const repay = Math.min(l.creditUsed, amount)
  return { ...l, creditUsed: l.creditUsed - repay, ownFunds: l.ownFunds + (amount - repay) }
}

/** Start of the calendar day an operation belongs to, given the current time. */
export function operationDay(op: Operation, nowMs: number): number {
  if (op.dayOffset !== undefined) {
    const d = new Date(startOfDay(nowMs))
    d.setDate(d.getDate() - op.dayOffset)
    return d.getTime()
  }
  return startOfDay(op.at)
}

export interface DayGroup {
  day: number
  /** parent BR-17: only money going out counts in the day header. */
  outSum: number
  items: Operation[]
}

/** Group history (newest first) by day, newest day first; item order within a day is kept. */
export function groupByDay(history: Operation[], nowMs: number): DayGroup[] {
  const map = new Map<number, DayGroup>()
  for (const op of history) {
    const day = operationDay(op, nowMs)
    let g = map.get(day)
    if (!g) {
      g = { day, outSum: 0, items: [] }
      map.set(day, g)
    }
    g.items.push(op)
    if (op.direction === 'out') g.outSum += op.amount
  }
  return [...map.values()].sort((a, b) => b.day - a.day)
}

/** Outgoing total for today — the "TODAY, {sum} TZS" header value. */
export function todayOutSum(history: Operation[], nowMs: number): number {
  const today = startOfDay(nowMs)
  return groupByDay(history, nowMs).find((g) => g.day === today)?.outSum ?? 0
}
