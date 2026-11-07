export type AmountStatus = 'below_min' | 'over_max' | 'over_balance' | 'ok'

export interface AmountRules {
  min: number
  max: number
  /** Money going out is checked against the available balance; incoming money is not. */
  available?: number
}

// parent BR-05: checked in this order — min → flow maximum → available balance.
// Below the minimum the primary button is disabled with no message.
export function validateAmount(amount: number, rules: AmountRules): AmountStatus {
  if (!Number.isFinite(amount) || amount < rules.min) return 'below_min'
  if (amount > rules.max) return 'over_max'
  if (rules.available !== undefined && amount > rules.available) return 'over_balance'
  return 'ok'
}
