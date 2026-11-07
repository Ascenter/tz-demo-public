// parent BR-05 and child flow maximums (Airtime BR-07, Bills BR-09).
export const MIN_AMOUNT = 1_000
export const DEFAULT_MAX = 5_000_000

export const FLOW_MAX = {
  fund: DEFAULT_MAX,
  send: DEFAULT_MAX,
  scan: DEFAULT_MAX,
  cash: DEFAULT_MAX, // Cash BRD Out of Scope: parent maximum applies
  airtime: 500_000,
  bills: 1_000_000,
} as const

/** Quick amount chips per flow (BRD field mapping). */
export const CHIPS = {
  fund: [10_000, 50_000, 100_000],
  cash: [10_000, 50_000, 100_000],
  airtime: [1_000, 2_000, 10_000],
  bills: [5_000, 10_000, 20_000],
  send: [] as number[], // Send BRD: quick chips not used
  scan: [] as number[], // Scan BRD: quick chips not used
} as const
