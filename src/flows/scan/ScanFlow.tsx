import { useState } from 'react'
import { useSteps, StepHost } from '../steps'
import { AmountStep, receiptDate } from '../shared'
import { useExitFlow } from '../exit'
import { Scanner } from './Scanner'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { BottomSheet, DetailRows, SheetTitle } from '../../components/BottomSheet'
import { PrimaryButton } from '../../components/PrimaryButton'
import { ConfirmButton } from '../../components/ConfirmButton'
import { OtpScreen } from '../../components/OtpScreen'
import { Receipt } from '../../components/Receipt'
import { useOnce } from '../../app/once'
import { useUi } from '../../app/ui'
import { useDemo, useAvailable } from '../../app/store'
import { simulate } from '../../engine/delay'
import { validateAmount } from '../../engine/validate'
import { formatNumber, formatTZS, parseAmount } from '../../engine/format'
import { FLOW_MAX, MIN_AMOUNT } from '../../mock/limits'
import { SCAN } from '../../mock/scripted'
import { scanOp } from '../../mock/operations'
import { t } from '../../mock/texts'

type Step = { name: 'scanner' } | { name: 'amount' } | { name: 'otp' } | { name: 'receipt' }

const GRADIENT = 'var(--gradient-flow-header-blue)'

/** Scan to pay, static TANQR (child BRD 3427598413). */
export function ScanFlow() {
  const exit = useExitFlow()
  const nav = useSteps<Step>({ name: 'scanner' })
  const avail = useAvailable()
  const [value, setValue] = useState('')
  const [comment, setComment] = useState('')
  const [sheet, setSheet] = useState(false)
  const [done, setDone] = useState<{ amount: number; comment: string; date: string } | null>(null)
  const once = useOnce()
  const amount = parseAmount(value)

  const onScanned = async () => {
    await simulate(() => null, { label: t('payments.scan_to_pay.checking_merchant') }) // Scan BR-03
    setValue('') // Scan BR-04: static QR, amount opens empty
    setComment('')
    nav.push({ name: 'amount' })
  }

  const afterOtp = async () => {
    await simulate(() => useDemo.getState().spend(scanOp(amount)))
    useUi.getState().showPush(t('payments.common.push_sent', { amount: formatNumber(amount), name: SCAN.merchant }))
    setDone({ amount, comment: comment.trim(), date: receiptDate() })
    nav.replace({ name: 'receipt' })
  }

  const step = nav.step
  let screen
  switch (step.name) {
    case 'scanner':
      screen = <Scanner onBack={exit} onScanned={() => void onScanned()} />
      break
    case 'amount': {
      // Scan BR-05: over TZS 5,000,000 is checked before the balance.
      const status = validateAmount(amount, { min: MIN_AMOUNT, max: FLOW_MAX.scan, available: avail })
      screen = (
        <AmountStep
          testId="scan-amount"
          gradient={GRADIENT}
          onBack={nav.pop} // back → scanner, amount not kept
          header={{ leading: <Avatar initials={SCAN.initials} color="#39cc7e" />, title: SCAN.merchant, badge: <Badge>{SCAN.bank}</Badge> }}
          value={value}
          onChange={setValue}
          hints={[t('payments.common.balance', { available: formatNumber(avail) }), t('payments.common.no_fee')]}
          error={
            status === 'over_max' ? t('payments.scan_to_pay.max_amount') : status === 'over_balance' ? t('payments.common.not_enough') : undefined
          }
          comment={{ value: comment, onChange: setComment, placeholder: t('payments.scan_to_pay.comment_hint') }}
          button={{ label: t('payments.scan_to_pay.pay'), disabled: status !== 'ok', onClick: () => setSheet(true) }}
        />
      )
      break
    }
    case 'otp':
      screen = <OtpScreen onSuccess={() => once.run(afterOtp)} onCancel={nav.pop} />
      break
    case 'receipt':
      screen = done && (
        <Receipt
          testId="scan-receipt"
          amount={done.amount}
          status={t('payments.scan_to_pay.success')}
          blocks={[
            [
              [t('payments.scan_to_pay.receipt_merchant'), SCAN.merchant],
              [t('payments.scan_to_pay.receipt_merchant_id'), `${SCAN.merchantId} | ${SCAN.bank}`],
            ],
            [
              [t('payments.scan_to_pay.receipt_fee'), t('payments.common.no_fee')],
              [t('payments.scan_to_pay.receipt_total'), formatTZS(done.amount)],
            ],
            [[t('payments.scan_to_pay.tips_reference'), SCAN.tipsReference]],
            [
              [t('payments.scan_to_pay.receipt_date'), done.date],
              [t('payments.scan_to_pay.receipt_comment'), done.comment || undefined], // Scan BR-10
            ],
          ]}
          doneLabel={t('payments.scan_to_pay.done')}
          onDone={exit}
        />
      )
      break
  }

  return (
    <div className="absolute inset-0" data-testid="scan-flow">
      <StepHost stepKey={nav.stepKey} dir={nav.dir}>
        {screen}
      </StepHost>
      <BottomSheet open={sheet} onDismiss={() => setSheet(false)} testId="scan-sheet">
        <SheetTitle title={t('payments.scan_to_pay.check_title')} subtitle={t('payments.scan_to_pay.check_subtitle')} />
        <DetailRows
          rows={[
            [t('payments.scan_to_pay.merchant'), SCAN.merchant],
            [t('payments.scan_to_pay.merchant_id'), SCAN.merchantId],
            [t('payments.scan_to_pay.merchant_bank'), SCAN.bank],
            [t('payments.scan_to_pay.location'), SCAN.location],
            [t('payments.scan_to_pay.amount'), formatTZS(amount)],
            [t('payments.scan_to_pay.fee'), t('payments.common.no_fee')],
            [t('payments.scan_to_pay.total'), formatTZS(amount)],
            [t('payments.scan_to_pay.comment'), comment.trim() || undefined],
          ]}
        />
        <div className="flex flex-col gap-[10px]">
          <ConfirmButton
            data-testid="sheet-confirm"
            onClick={() => {
              setSheet(false)
              nav.push({ name: 'otp' })
            }}
          >
            {t('payments.scan_to_pay.pay')}
          </ConfirmButton>
          <PrimaryButton variant="nobg" data-testid="sheet-cancel" onClick={() => setSheet(false)}>
            {t('payments.scan_to_pay.cancel')}
          </PrimaryButton>
        </div>
      </BottomSheet>
    </div>
  )
}
