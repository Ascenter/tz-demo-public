import { DATE_TOKEN, type Operation } from '../engine/money'
import { t } from './texts'
import { SCAN, CASH, GOV } from './scripted'
import { groupDigits } from '../engine/format'

// Feed/history entries per flow (each child BRD's "Feed and history entry" row).
export type OpDraft = Omit<Operation, 'id' | 'at'>

export const fundOp = (amount: number): OpDraft => ({
  title: t('payments.fund_account.history_title'),
  subtitle: t('payments.fund_account.history_subtitle'),
  amount,
  direction: 'in',
  category: 'topup',
})

export const sendOp = (name: string, bank: string, amount: number): OpDraft => ({
  title: name,
  subtitle: t('payments.send_money.history_to_account', { bank }),
  amount,
  direction: 'out',
  category: 'transfer',
})

export const scanOp = (amount: number): OpDraft => ({
  title: SCAN.merchant,
  subtitle: t('payments.scan_to_pay.history_subtitle'),
  amount,
  direction: 'out',
  category: 'qr',
  initials: SCAN.initials,
})

// Cash v5: the receipt content now lives in the history entry's transaction details.
export const cashOp = (amount: number): OpDraft => ({
  title: t('payments.cash_withdrawal.history_title'),
  subtitle: t('payments.cash_withdrawal.history_subtitle', { agent: CASH.agent }),
  amount,
  direction: 'out',
  category: 'cash',
  details: {
    status: t('payments.cash_withdrawal.success'),
    blocks: [
      [
        [t('payments.cash_withdrawal.agent_label'), CASH.agent],
        [t('payments.cash_withdrawal.agent_id'), CASH.agentId],
      ],
      [[t('payments.cash_withdrawal.fee'), t('payments.common.no_fee')]],
      [[t('payments.cash_withdrawal.reference'), CASH.reference]],
      [
        [t('payments.cash_withdrawal.date'), DATE_TOKEN],
        [t('payments.cash_withdrawal.location'), CASH.location],
      ],
    ],
  },
})

export const airtimeOp = (name: string, operator: string, amount: number): OpDraft => ({
  title: name,
  subtitle: t('payments.airtime.history_subtitle', { operator }),
  amount,
  direction: 'out',
  category: 'airtime',
})

export const govOp = (): OpDraft => ({
  title: t('payments.gov.history_title'),
  subtitle: t('payments.gov.history_subtitle'),
  amount: GOV.amount,
  direction: 'out',
  category: 'gov',
})

export const lukuOp = (meter: string, amount: number): OpDraft => ({
  title: t('payments.bills.history_title'),
  subtitle: t('payments.bills.history_subtitle', { meter: groupDigits(meter, [4, 4, 3]) }),
  amount,
  direction: 'out',
  category: 'bills',
})
