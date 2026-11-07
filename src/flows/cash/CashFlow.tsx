import { useEffect, useState } from 'react'
import { useSteps, StepHost } from '../steps'
import { AmountStep, receiptDate } from '../shared'
import { useExitFlow } from '../exit'
import { Screen } from '../../components/Screen'
import { LargeTitle, NavBar } from '../../components/NavBar'
import { ListRow } from '../../components/ListRow'
import { Avatar } from '../../components/Avatar'
import { BottomSheet, DetailRows, SheetTitle } from '../../components/BottomSheet'
import { PrimaryButton } from '../../components/PrimaryButton'
import { ConfirmButton } from '../../components/ConfirmButton'
import { ResultScreen } from '../../components/ResultScreen'
import { Receipt } from '../../components/Receipt'
import { useBack } from '../../app/back'
import { useUi } from '../../app/ui'
import { useDemo, useAvailable } from '../../app/store'
import { simulate } from '../../engine/delay'
import { validateAmount } from '../../engine/validate'
import { formatNumber, formatTZS, formatTime, parseAmount } from '../../engine/format'
import { now } from '../../engine/clock'
import { CHIPS, FLOW_MAX, MIN_AMOUNT } from '../../mock/limits'
import { CASH } from '../../mock/scripted'
import { cashOp } from '../../mock/operations'
import { t } from '../../mock/texts'

type Step = { name: 'methods' } | { name: 'amount' } | { name: 'code'; until: string } | { name: 'receipt' }

const GRADIENT = 'var(--gradient-cash)'

/** Cash withdrawal at a Wakala agent (child BRD 3432644674). */
export function CashFlow() {
  const exit = useExitFlow()
  const nav = useSteps<Step>({ name: 'methods' })
  const avail = useAvailable()
  const [value, setValue] = useState('')
  const [sheet, setSheet] = useState(false)
  const [done, setDone] = useState<{ amount: number; date: string } | null>(null)
  const amount = parseAmount(value)

  const getCode = async () => {
    setSheet(false)
    await simulate(() => null) // Cash BR-04: no OTP, no debit yet
    const until = formatTime(new Date(now() + CASH.validMinutes * 60_000)) // Cash BR-05
    nav.push({ name: 'code', until })
  }

  const approve = async () => {
    await simulate(() => useDemo.getState().spend(cashOp(amount))) // Cash BR-07: debit at Approve
    useUi.getState().showPush(t('payments.cash_withdrawal.push', { amount: formatNumber(amount), agent: CASH.agent }))
    setDone({ amount, date: receiptDate() })
    nav.replace({ name: 'receipt' })
  }

  const step = nav.step
  let screen
  switch (step.name) {
    case 'methods':
      screen = (
        <Methods
          onBack={exit}
          onAgent={() => {
            setValue('')
            nav.push({ name: 'amount' })
          }}
        />
      )
      break
    case 'amount': {
      const status = validateAmount(amount, { min: MIN_AMOUNT, max: FLOW_MAX.cash, available: avail })
      screen = (
        <AmountStep
          testId="cash-amount"
          gradient={GRADIENT}
          onBack={nav.pop} // typed amount is not kept
          header={{
            leading: <Avatar icon="wallet" color="#88c758" />,
            title: t('payments.cash_withdrawal.amount_title'),
            subtitle: t('payments.cash_withdrawal.amount_subtitle'),
          }}
          value={value}
          onChange={setValue}
          hints={[t('payments.common.balance_hint', { available: formatNumber(avail) })]}
          error={
            status === 'over_max' ? t('payments.common.over_limit') : status === 'over_balance' ? t('payments.common.not_enough') : undefined
          }
          chips={CHIPS.cash}
          button={{ label: t('payments.common.continue'), disabled: status !== 'ok', onClick: () => setSheet(true) }}
        />
      )
      break
    }
    case 'code':
      screen = <CodeScreen amount={amount} until={step.until} onLeave={exit} onApprove={approve} />
      break
    case 'receipt':
      screen = done && (
        <Receipt
          testId="cash-receipt"
          amount={done.amount}
          status={t('payments.cash_withdrawal.success')}
          blocks={[
            [
              [t('payments.cash_withdrawal.agent_label'), CASH.agent],
              [t('payments.cash_withdrawal.agent_id'), CASH.agentId],
            ],
            [[t('payments.cash_withdrawal.fee'), t('payments.common.no_fee')]],
            [[t('payments.cash_withdrawal.reference'), CASH.reference]],
            [
              [t('payments.cash_withdrawal.date'), done.date],
              [t('payments.cash_withdrawal.location'), CASH.location],
            ],
          ]}
          doneLabel={t('payments.cash_withdrawal.done')}
          onDone={exit}
        />
      )
      break
  }

  return (
    <div className="absolute inset-0" data-testid="cash-flow">
      <StepHost stepKey={nav.stepKey} dir={nav.dir}>
        {screen}
      </StepHost>
      <BottomSheet open={sheet} onDismiss={() => setSheet(false)} testId="cash-sheet">
        <SheetTitle title={t('payments.cash_withdrawal.code_sheet_title')} subtitle={t('payments.cash_withdrawal.code_sheet_subtitle')} />
        <DetailRows
          rows={[
            [t('payments.cash_withdrawal.amount'), formatTZS(amount)],
            [t('payments.cash_withdrawal.fee'), t('payments.common.no_fee')],
            [t('payments.cash_withdrawal.code_valid'), t('payments.cash_withdrawal.code_valid_value')],
          ]}
        />
        <div className="flex flex-col gap-[10px]">
          <ConfirmButton data-testid="sheet-confirm" onClick={() => void getCode()}>
            {t('payments.cash_withdrawal.get_code')}
          </ConfirmButton>
          <PrimaryButton variant="nobg" data-testid="sheet-cancel" onClick={() => setSheet(false)}>
            {t('payments.common.cancel')}
          </PrimaryButton>
        </div>
      </BottomSheet>
    </div>
  )
}

function Methods({ onBack, onAgent }: { onBack: () => void; onAgent: () => void }) {
  useBack(onBack)
  return (
    <Screen testId="cash-methods" gradient={GRADIENT} header={<><NavBar onBack={onBack} /><LargeTitle title={t('payments.cash_withdrawal.method_title')} /></>}>
      <ListRow testId="cash-agent" icon="user" avatarColor="#88c758" title={t('payments.cash_withdrawal.agent')} subtitle={t('payments.cash_withdrawal.agent_subtitle')} onClick={onAgent} />
      {/* Cash BR-02: inactive rows, a tap does nothing */}
      <ListRow icon="card" avatarColor="#566dcc" title={t('payments.cash_withdrawal.atm')} subtitle={t('payments.cash_withdrawal.atm_subtitle')} />
      <ListRow initials="M" avatarColor="#00a651" title={t('payments.cash_withdrawal.mpesa')} subtitle={t('payments.cash_withdrawal.mpesa_subtitle')} />
    </Screen>
  )
}

/**
 * Code screen (Figma 176:2903). The presenter's "Agent entered the code" works only while this screen
 * is open (Cash BR-06, BR-09). Leaving, Done or Cancel code discards the code, no debit (BR-10).
 */
function CodeScreen({ amount, until, onLeave, onApprove }: { amount: number; until: string; onLeave: () => void; onApprove: () => Promise<void> }) {
  const [approval, setApproval] = useState(false)
  useEffect(() => {
    const open = () => setApproval(true)
    useUi.getState().setAgentEntered(open)
    return () => {
      if (useUi.getState().agentEntered === open) useUi.getState().setAgentEntered(null)
    }
  }, [])

  return (
    <>
      <ResultScreen
        testId="cash-code"
        kind="cash"
        title={
          <span data-testid="cash-code-value" className="font-display text-amount-input font-semibold">
            {CASH.code}
          </span>
        }
        body={t('payments.cash_withdrawal.code_hint', { amount: formatNumber(amount), time: until })}
        extra={
          <p className="w-full rounded-component bg-highlight px-4 py-3 text-center text-caption">{t('payments.cash_withdrawal.never_share')}</p>
        }
        secondary={{ label: t('payments.cash_withdrawal.cancel_code'), onClick: onLeave }}
        primary={{ label: t('payments.cash_withdrawal.done'), onClick: onLeave }}
        onBack={onLeave}
      />
      {/* Swipe down → back to the code screen; Decline → Payments, no debit. */}
      <BottomSheet open={approval} onDismiss={() => setApproval(false)} testId="cash-approve-sheet">
        <SheetTitle title={t('payments.cash_withdrawal.approve_title')} subtitle={t('payments.cash_withdrawal.approve_subtitle')} />
        <DetailRows
          rows={[
            [t('payments.cash_withdrawal.agent_label'), CASH.agent],
            [t('payments.cash_withdrawal.agent_id'), CASH.agentId],
            [t('payments.cash_withdrawal.location'), CASH.location],
            [t('payments.cash_withdrawal.amount'), formatTZS(amount)],
          ]}
        />
        <div className="flex flex-col gap-[10px]">
          <ConfirmButton
            data-testid="sheet-confirm"
            onClick={() => {
              setApproval(false)
              void onApprove()
            }}
          >
            {t('payments.cash_withdrawal.approve')}
          </ConfirmButton>
          <PrimaryButton variant="nobg" data-testid="sheet-cancel" onClick={onLeave}>
            {t('payments.cash_withdrawal.decline')}
          </PrimaryButton>
        </div>
      </BottomSheet>
    </>
  )
}
