import { useDemo } from '../../app/store'
import { cashOp } from '../../mock/operations'

/**
 * Cash BR-07/BR-08 (child v5): Done on the code screen debits the typed amount (own funds first)
 * and writes "Cash withdrawal · Wakala agent, Juma Shop" on top of Today, with transaction details.
 * Callers guard it so one Done makes exactly one debit.
 */
export function completeCashWithdrawal(amount: number): void {
  useDemo.getState().spend(cashOp(amount))
}
