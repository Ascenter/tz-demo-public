import type { OpDraft } from './operations'
import { fundOp, sendOp, scanOp, cashOp, airtimeOp, govOp, lukuOp } from './operations'
import { BARAKA_INTERNAL, MO_SIMBA, SEED_RECENT, type SendRecipient } from './recipients'
import { SEND, BILLS } from './scripted'

// parent "Master demo script": the state after each step. Used by "Jump to step N" and by the e2e test.

export interface ScriptStep {
  step: number
  flow: string
  ops: OpDraft[]
  /** Send money side effects: recipients used (in order) and contacts saved. */
  recipients?: SendRecipient[]
  saved?: Record<string, string>
  expected: { available: number; ownFunds: number; today: number }
}

const TIPS_BARAKA: SendRecipient = {
  account: '0152487639100',
  name: SEND.tipsNameAtBank,
  bank: 'CRDB Bank',
  kind: 'tips',
}

export const MASTER_SCRIPT: ScriptStep[] = [
  { step: 0, flow: 'Reset', ops: [], expected: { available: 910_000, ownFunds: 250_000, today: 103_500 } },
  {
    step: 1,
    flow: 'Fund my account',
    ops: [fundOp(50_000), fundOp(100_000), fundOp(50_000)],
    expected: { available: 1_110_000, ownFunds: 450_000, today: 103_500 },
  },
  {
    step: 2,
    flow: 'Send money',
    ops: [
      sendOp(BARAKA_INTERNAL.name, MO_SIMBA, 50_000),
      sendOp('Neema Mushi', MO_SIMBA, 35_000),
      sendOp(SEND.tipsNameAtBank, 'CRDB Bank', 50_000),
    ],
    recipients: [BARAKA_INTERNAL, SEED_RECENT[0], TIPS_BARAKA],
    saved: { [BARAKA_INTERNAL.account]: 'Baraka Mwakyusa' },
    expected: { available: 975_000, ownFunds: 315_000, today: 238_500 },
  },
  { step: 3, flow: 'Scan to pay', ops: [scanOp(25_000)], expected: { available: 950_000, ownFunds: 290_000, today: 263_500 } },
  {
    step: 4,
    flow: 'Cash withdrawal',
    ops: [cashOp(50_000)],
    expected: { available: 900_000, ownFunds: 240_000, today: 313_500 },
  },
  {
    step: 5,
    flow: 'Airtime',
    ops: [airtimeOp('Neema Mushi', 'Vodacom', 5_000)],
    expected: { available: 895_000, ownFunds: 235_000, today: 318_500 },
  },
  { step: 6, flow: 'Government bill', ops: [govOp()], expected: { available: 695_000, ownFunds: 35_000, today: 518_500 } },
  {
    step: 7,
    flow: 'Bill payments (LUKU)',
    ops: [lukuOp(BILLS.meter, 20_000)],
    expected: { available: 675_000, ownFunds: 15_000, today: 538_500 },
  },
]

export const CREDIT_LIMIT_THROUGHOUT = 660_000
