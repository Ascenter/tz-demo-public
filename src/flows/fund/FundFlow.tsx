import { useState } from 'react'
import { useSteps, StepHost } from '../steps'
import { AmountStep } from '../shared'
import { useExitFlow } from '../exit'
import { MpesaPrompt } from './MpesaPrompt'
import { Screen } from '../../components/Screen'
import { LargeTitle, NavBar } from '../../components/NavBar'
import { ListRow } from '../../components/ListRow'
import { Avatar } from '../../components/Avatar'
import { BottomSheet, DetailRows, SheetTitle } from '../../components/BottomSheet'
import { PrimaryButton } from '../../components/PrimaryButton'
import { ConfirmButton } from '../../components/ConfirmButton'
import { ResultScreen } from '../../components/ResultScreen'
import { useBack } from '../../app/back'
import { useOnce } from '../../app/once'
import { useUi } from '../../app/ui'
import { useDemo } from '../../app/store'
import { simulate } from '../../engine/delay'
import { validateAmount } from '../../engine/validate'
import { available } from '../../engine/money'
import { formatNumber, formatTZS, parseAmount } from '../../engine/format'
import { CHIPS, FLOW_MAX, MIN_AMOUNT } from '../../mock/limits'
import { FUND } from '../../mock/scripted'
import { fundOp } from '../../mock/operations'
import { t } from '../../mock/texts'

type Step =
  | { name: 'methods' }
  | { name: 'amount' }
  | { name: 'waiting' }
  | { name: 'success' | 'declined' | 'not_enough' | 'in_progress' }

const GRADIENT = 'var(--gradient-fund)'
const MpesaAvatar = () => <Avatar initials="M" color="#00a651" />

/** Route entry: Done/Close/Got it return to the screen the flow started from (Fund BR-10). */
export function FundRoute() {
  return <FundFlow onExit={useExitFlow()} />
}

/**
 * Fund my account via M-Pesa (child BRD 3426713624). `onExit` lets Bills open this flow and get
 * control back on every exit (Bills BR-13).
 */
export function FundFlow({ onExit }: { onExit: () => void }) {
  const nav = useSteps<Step>({ name: 'methods' })
  const [value, setValue] = useState('')
  const [sheet, setSheet] = useState(false)
  const amount = parseAmount(value)

  // Fund BR-08: success credits own funds, updates feed and history, push for money coming in.
  const creditNow = () => {
    useDemo.getState().receive(fundOp(amount))
    useUi.getState().showPush(t('payments.common.push_added', { amount: formatNumber(amount) }))
  }

  const sendPrompt = async () => {
    const outcome = await simulate(() =>
      amount > FUND.mpesaWalletBalance ? 'not_enough' : amount === FUND.inProgressAmount ? 'in_progress' : 'success',
    )
    if (outcome === 'success') creditNow()
    nav.replace({ name: outcome })
  }

  const step = nav.step
  let screen
  switch (step.name) {
    case 'methods':
      screen = <Methods onBack={onExit} onMpesa={() => nav.push({ name: 'amount' })} />
      break
    case 'amount': {
      const status = validateAmount(amount, { min: MIN_AMOUNT, max: FLOW_MAX.fund }) // money in: no balance check
      screen = (
        <AmountStep
          testId="fund-amount"
          gradient={GRADIENT}
          onBack={nav.pop}
          header={{ leading: <MpesaAvatar />, title: t('payments.fund_account.amount_title'), subtitle: FUND.mpesaNumberMasked }}
          value={value}
          onChange={setValue}
          hints={[t('payments.fund_account.amount_hint')]}
          error={status === 'over_max' ? t('payments.fund_account.over_limit') : undefined}
          chips={CHIPS.fund}
          button={{ label: t('payments.fund_account.continue'), disabled: status !== 'ok', onClick: () => setSheet(true) }}
        />
      )
      break
    }
    case 'waiting':
      screen = <Waiting amount={amount} onSend={sendPrompt} onCancel={() => nav.replace({ name: 'declined' })} />
      break
    case 'success':
      screen = (
        <ResultScreen
          testId="fund-success"
          kind="success"
          title={t('payments.fund_account.success', { amount: formatNumber(amount) })}
          body={t('payments.fund_account.success_body', {
            balance: formatNumber(available(useDemo.getState().ledger)),
            receipt: FUND.mpesaReceipt,
          })}
          primary={{ label: t('payments.fund_account.done'), onClick: onExit }}
        />
      )
      break
    case 'in_progress':
      screen = <InProgress amount={amount} onGotIt={() => { creditNow(); onExit() }} />
      break
    case 'declined':
      screen = (
        <ResultScreen
          testId="fund-declined"
          kind="error"
          title={t('payments.fund_account.declined')}
          body={t('payments.fund_account.declined_body')}
          primary={{
            label: t('payments.fund_account.try_again'),
            onClick: async () => {
              await simulate(() => null)
              nav.replace({ name: 'waiting' })
            },
          }}
          secondary={{ label: t('payments.fund_account.close'), onClick: onExit }}
          onBack={onExit}
        />
      )
      break
    case 'not_enough':
      screen = (
        <ResultScreen
          testId="fund-not-enough"
          kind="error"
          title={t('payments.fund_account.not_enough')}
          body={t('payments.fund_account.not_enough_body', { amount: formatNumber(amount) })}
          primary={{ label: t('payments.fund_account.change_amount'), onClick: () => nav.popTo((s) => s.name === 'amount') }}
          secondary={{ label: t('payments.fund_account.close'), onClick: onExit }}
          onBack={onExit}
        />
      )
      break
  }

  return (
    <div className="absolute inset-0" data-testid="fund-flow">
      <StepHost stepKey={nav.stepKey} dir={nav.dir}>
        {screen}
      </StepHost>
      <ConfirmSheet
        open={sheet}
        amount={amount}
        onCancel={() => setSheet(false)}
        onConfirm={async () => {
          setSheet(false)
          await simulate(() => null)
          nav.push({ name: 'waiting' })
        }}
      />
    </div>
  )
}

function Methods({ onBack, onMpesa }: { onBack: () => void; onMpesa: () => void }) {
  useBack(onBack)
  return (
    <Screen testId="fund-methods" gradient={GRADIENT} header={<><NavBar onBack={onBack} /><LargeTitle title={t('payments.fund_account.title')} /></>}>
      <ListRow testId="fund-mpesa" leading={<MpesaAvatar />} title={t('payments.fund_account.mpesa')} subtitle={t('payments.fund_account.mpesa_subtitle')} onClick={onMpesa} />
      {/* Fund OQ-1 a): shown as in Figma, a tap does nothing */}
      <ListRow leading={<Avatar initials="A" color="#e40000" />} title={t('payments.fund_account.airtel')} subtitle={t('payments.fund_account.airtel_subtitle')} />
      <ListRow icon="bank" avatarColor="#566dcc" title={t('payments.fund_account.bank')} subtitle={t('payments.fund_account.bank_subtitle')} />
    </Screen>
  )
}

function ConfirmSheet({ open, amount, onCancel, onConfirm }: { open: boolean; amount: number; onCancel: () => void; onConfirm: () => Promise<void> }) {
  return (
    <BottomSheet open={open} onDismiss={onCancel} testId="fund-sheet">
      <SheetTitle title={t('payments.fund_account.confirm_title')} subtitle={t('payments.fund_account.confirm_subtitle')} />
      <DetailRows
        rows={[
          [t('payments.fund_account.amount'), formatTZS(amount)],
          [t('payments.fund_account.from'), t('payments.fund_account.from_value', { number: FUND.mpesaNumberMasked })],
          [t('payments.fund_account.fee'), t('payments.common.no_fee')],
        ]}
      />
      <div className="flex flex-col gap-[10px]">
        <ConfirmButton data-testid="sheet-confirm" onClick={() => void onConfirm()}>
          {t('payments.fund_account.top_up', { amount: formatNumber(amount) })}
        </ConfirmButton>
        <PrimaryButton variant="nobg" data-testid="sheet-cancel" onClick={onCancel}>
          {t('payments.fund_account.cancel')}
        </PrimaryButton>
      </div>
    </BottomSheet>
  )
}

/** "Check your phone" with the emulated prompt on top. Back does nothing here (Fund Navigation). */
function Waiting({ amount, onSend, onCancel }: { amount: number; onSend: () => Promise<void>; onCancel: () => void }) {
  useBack(null)
  const once = useOnce()
  return (
    <div className="absolute inset-0" data-testid="fund-waiting">
      <Screen header={<NavBar />} scroll={false}>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-10 text-center">
          <span className="grid size-40 place-items-center rounded-full bg-[linear-gradient(135deg,#e5ecff,#b8b8ff)] text-[64px]">📱</span>
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-fraction font-semibold">{t('payments.fund_account.check_phone')}</h1>
            <p className="text-body-m text-secondary">{t('payments.fund_account.check_phone_body', { amount: formatNumber(amount) })}</p>
          </div>
        </div>
      </Screen>
      <MpesaPrompt open amount={amount} onCancel={() => once.run(onCancel)} onSend={() => once.run(onSend)} />
    </div>
  )
}

function InProgress({ amount, onGotIt }: { amount: number; onGotIt: () => void }) {
  const once = useOnce()
  const gotIt = () => once.run(onGotIt)
  return (
    <ResultScreen
      testId="fund-in-progress"
      kind="pending"
      title={t('payments.fund_account.in_progress')}
      body={t('payments.fund_account.in_progress_body', { amount: formatNumber(amount) })}
      primary={{ label: t('payments.fund_account.got_it'), onClick: gotIt }}
    />
  )
}
