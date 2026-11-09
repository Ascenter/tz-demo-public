import type { ComponentProps, ReactNode } from 'react'
import { Screen } from '../components/Screen'
import { HeaderItem, NavBar } from '../components/NavBar'
import { AmountEntry } from '../components/AmountEntry'
import { useBack } from '../app/back'
import { CUSTOMER } from '../mock/seed'
import { t } from '../mock/texts'
import { formatDateTime } from '../engine/format'
import { now } from '../engine/clock'

interface AmountStepProps extends ComponentProps<typeof AmountEntry> {
  gradient: string
  onBack: () => void
  header: { leading: ReactNode; title: ReactNode; badge?: ReactNode; subtitle?: ReactNode; compact?: boolean }
  testId?: string
}

/** Amount screen: gradient header with the recipient, amount entry on the white sheet (Figma 130:1441). */
export function AmountStep({ gradient, onBack, header, testId, ...entry }: AmountStepProps) {
  useBack(onBack)
  return (
    <Screen
      testId={testId ?? 'amount-screen'}
      gradient={gradient}
      scroll={false}
      sheetPadding={false}
      gradientFull
      header={
        <>
          <NavBar onBack={onBack} />
          <HeaderItem {...header} />
        </>
      }
    >
      <AmountEntry {...entry} />
    </Screen>
  )
}

/** "•••• 7788 | Mo-Simba" — the customer account on receipts (parent seed). */
export const paidFromValue = () => t('payments.common.account_value', { account: CUSTOMER.accountMasked, bank: CUSTOMER.bank })

/** Receipt date = device time. */
export const receiptDate = () => formatDateTime(new Date(now()))

/** "•••• 6789" from a full account number. */
export const maskAccount = (account: string) => `•••• ${account.slice(-4)}`

/** "0150 •••• 6789" (Save contact read-only field). */
export const maskAccountMiddle = (account: string) => `${account.slice(0, 4)} •••• ${account.slice(-4)}`
