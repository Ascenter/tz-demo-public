import { useState } from 'react'
import { useSteps, StepHost } from '../steps'
import { AmountStep, maskAccount, paidFromValue, receiptDate } from '../shared'
import { useExitFlow } from '../exit'
import { RecipientsScreen, SEND_GRADIENT, bankBadge } from './RecipientsScreen'
import { BankForm, SelectBank } from './BankScreens'
import { SaveContact } from './SaveContact'
import { Avatar, colorFor, initialsOf } from '../../components/Avatar'
import { BottomSheet, DetailRows, SheetTitle } from '../../components/BottomSheet'
import { PrimaryButton, MiniButton } from '../../components/PrimaryButton'
import { ConfirmButton } from '../../components/ConfirmButton'
import { OtpScreen } from '../../components/OtpScreen'
import { Receipt } from '../../components/Receipt'
import { useOnce } from '../../app/once'
import { useUi } from '../../app/ui'
import { useDemo, useAvailable, displayName } from '../../app/store'
import { simulate } from '../../engine/delay'
import { validateAmount } from '../../engine/validate'
import { formatNumber, formatTZS, parseAmount } from '../../engine/format'
import { FLOW_MAX, MIN_AMOUNT } from '../../mock/limits'
import { SEND } from '../../mock/scripted'
import { CUSTOMER } from '../../mock/seed'
import { sendOp } from '../../mock/operations'
import { t } from '../../mock/texts'
import type { SendRecipient } from '../../mock/recipients'

type Step =
  | { name: 'recipients' }
  | { name: 'banks' }
  | { name: 'bankForm'; bank: string }
  | { name: 'amount' }
  | { name: 'otp' }
  | { name: 'receipt' }
  | { name: 'save' }

interface Done {
  name: string
  amount: number
  comment: string
  date: string
  recipient: SendRecipient
}

/** Send money (child BRD 3410853909): internal P2P, TIPS, save contact, saved recipient. */
export function SendFlow() {
  const exit = useExitFlow()
  const nav = useSteps<Step>({ name: 'recipients' })
  const avail = useAvailable()
  const saved = useDemo((s) => s.saved)
  const recent = useDemo((s) => s.recent)
  const [recipient, setRecipient] = useState<SendRecipient | null>(null)
  const [value, setValue] = useState('')
  const [comment, setComment] = useState('')
  const [sheet, setSheet] = useState(false)
  const [done, setDone] = useState<Done | null>(null)
  const once = useOnce()
  const amount = parseAmount(value)

  const pick = (r: SendRecipient) => {
    setRecipient(r)
    setValue('')
    setComment('')
    nav.push({ name: 'amount' })
  }

  // Send BR-06: new internal recipient (not saved, not in Recent) → "Check the recipient"; every TIPS → "Check the transfer".
  const isKnown = (r: SendRecipient) => recent.some((x) => x.account === r.account) || r.account in saved
  const needsSheet = (r: SendRecipient) => r.kind === 'tips' || !isKnown(r)

  const onSend = () => {
    if (!recipient) return
    if (needsSheet(recipient)) setSheet(true)
    else nav.push({ name: 'otp' })
  }

  const afterOtp = async () => {
    if (!recipient) return
    const name = displayName(recipient, useDemo.getState().saved)
    await simulate(() => {
      const s = useDemo.getState()
      s.spend(sendOp(name, recipient.bank, amount)) // feed keeps the name it was created with
      s.useRecipient(recipient)
    })
    useUi.getState().showPush(t('payments.common.push_sent', { amount: formatNumber(amount), name }))
    setDone({ name, amount, comment: comment.trim(), date: receiptDate(), recipient })
    nav.replace({ name: 'receipt' })
  }

  const step = nav.step
  let screen
  switch (step.name) {
    case 'recipients':
      screen = <RecipientsScreen onBack={exit} onPick={pick} onOtherBank={() => nav.push({ name: 'banks' })} />
      break
    case 'banks':
      screen = <SelectBank onBack={nav.pop} onPick={(bank) => nav.push({ name: 'bankForm', bank })} />
      break
    case 'bankForm':
      screen = <BankForm bank={step.bank} onBack={nav.pop} onContinue={pick} />
      break
    case 'amount': {
      if (!recipient) break
      const name = displayName(recipient, saved)
      const status = validateAmount(amount, { min: MIN_AMOUNT, max: FLOW_MAX.send, available: avail })
      screen = (
        <AmountStep
          testId="send-amount"
          gradient={SEND_GRADIENT}
          onBack={nav.pop}
          header={{ leading: <Avatar initials={initialsOf(name)} color={colorFor(name)} />, title: name, badge: bankBadge(recipient.bank) }}
          value={value}
          onChange={setValue}
          hints={[t('payments.common.balance', { available: formatNumber(avail) }), t('payments.common.no_fee')]}
          error={
            status === 'over_max' ? t('payments.common.over_limit') : status === 'over_balance' ? t('payments.common.not_enough') : undefined
          }
          comment={{ value: comment, onChange: setComment, placeholder: t('payments.send_money.comment') }}
          button={{ label: t('payments.send_money.send'), disabled: status !== 'ok', onClick: onSend }}
        />
      )
      break
    }
    case 'otp':
      screen = <OtpScreen onSuccess={() => once.run(afterOtp)} onCancel={nav.pop} />
      break
    case 'receipt': {
      if (!done) break
      const r = done.recipient
      const tips = r.kind === 'tips'
      const canSave = !tips && !(r.account in saved)
      screen = (
        <Receipt
          testId="send-receipt"
          amount={done.amount}
          status={t('payments.send_money.success')}
          blocks={[
            [
              [t('payments.send_money.receipt_recipient'), done.name],
              [
                t('payments.send_money.receipt_account'),
                <span className="flex flex-col items-start gap-3">
                  <span>{t('payments.common.account_value', { account: maskAccount(r.account), bank: r.bank })}</span>
                  {canSave && (
                    <MiniButton testId="save-contact" onClick={() => nav.push({ name: 'save' })}>
                      {t('payments.send_money.save_contact_action')}
                    </MiniButton>
                  )}
                </span>,
              ],
            ],
            // Figma 12:5552 / 1:10250: internal transfers show the sender and their account, no fee lines.
            [
              [t('payments.send_money.receipt_sender'), tips ? undefined : CUSTOMER.name],
              [t('payments.send_money.receipt_account'), tips ? undefined : paidFromValue()],
            ],
            // Figma 42:5875: TIPS shows Fee and Total (FIGMA_VS_BRD leaves it open; ASSUMPTIONS A6).
            [
              [t('payments.send_money.receipt_fee'), tips ? t('payments.common.no_fee') : undefined],
              [t('payments.send_money.receipt_total'), tips ? formatTZS(done.amount) : undefined],
            ],
            [[t('payments.send_money.tips_reference'), tips ? SEND.tipsReference : undefined, 'small']],
            [
              [t('payments.send_money.receipt_date'), done.date],
              [t('payments.send_money.receipt_comment'), done.comment || undefined],
            ],
          ]}
          doneLabel={t('payments.send_money.done')}
          onDone={exit}
        />
      )
      break
    }
    case 'save':
      screen = done && <SaveContact recipient={done.recipient} onBack={nav.pop} onSaved={nav.pop} />
      break
  }

  const r = recipient
  return (
    <div className="absolute inset-0" data-testid="send-flow">
      <StepHost stepKey={nav.stepKey} dir={nav.dir}>
        {screen}
      </StepHost>
      <BottomSheet open={sheet && !!r} onDismiss={() => setSheet(false)} testId="send-sheet">
        {r && (
          <>
            {r.kind === 'tips' ? (
              <SheetTitle title={t('payments.send_money.check_transfer_title')} subtitle={t('payments.send_money.check_transfer_subtitle')} />
            ) : (
              <SheetTitle title={t('payments.send_money.check_recipient_title')} subtitle={t('payments.send_money.check_recipient_subtitle')} />
            )}
            <DetailRows
              rows={[
                [t('payments.send_money.receipt_recipient'), displayName(r, saved)],
                [t('payments.send_money.receipt_phone'), r.kind === 'tips' ? undefined : r.phone],
                [t('payments.send_money.receipt_bank'), r.bank],
                [t('payments.send_money.receipt_account'), r.kind === 'tips' ? maskAccount(r.account) : undefined],
                [t('payments.send_money.receipt_amount'), formatTZS(amount)],
                [t('payments.send_money.receipt_fee'), t('payments.common.no_fee')],
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
                {t('payments.send_money.send')}
              </ConfirmButton>
              <PrimaryButton variant="nobg" data-testid="sheet-cancel" onClick={() => setSheet(false)}>
                {t('payments.send_money.cancel')}
              </PrimaryButton>
            </div>
          </>
        )}
      </BottomSheet>
    </div>
  )
}
