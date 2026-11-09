import { useMemo, useState } from 'react'
import { useSteps, StepHost } from '../steps'
import { AmountStep, paidFromValue, receiptDate } from '../shared'
import { useExitFlow } from '../exit'
import { completeLocal, operatorOf, toIntl } from './numbers'
import { Screen } from '../../components/Screen'
import { CapsHeader, ListRow } from '../../components/ListRow'
import { SearchHeader } from '../../components/SearchHeader'
import { Illustration } from '../../components/Illustration'
import { Avatar, colorFor, initialsOf } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { OtpScreen } from '../../components/OtpScreen'
import { Receipt } from '../../components/Receipt'
import { useBack } from '../../app/back'
import { useOnce } from '../../app/once'
import { useUi } from '../../app/ui'
import { useDemo, useAvailable } from '../../app/store'
import { simulate } from '../../engine/delay'
import { validateAmount } from '../../engine/validate'
import { digitsOnly, formatNumber, parseAmount } from '../../engine/format'
import { CHIPS, FLOW_MAX, MIN_AMOUNT } from '../../mock/limits'
import { AIRTIME_CONTACTS, AIRTIME_MY_NUMBER, AIRTIME_RECENT, type AirtimeContact } from '../../mock/recipients'
import { airtimeOp } from '../../mock/operations'
import { t } from '../../mock/texts'

interface Target {
  /** Contact name, or null for a typed number that is not a contact (Airtime BR-05). */
  name: string | null
  phone: string
  operator: string
}

type Step = { name: 'recipients' } | { name: 'amount' } | { name: 'otp' } | { name: 'receipt' }

const GRADIENT = 'var(--gradient-flow-header-blue)' // Figma: same lilac header as transfers
const ALL_CONTACTS = [AIRTIME_MY_NUMBER, ...AIRTIME_RECENT, ...AIRTIME_CONTACTS]

/** Airtime (child BRD 3437592577): no Airtime/Data switch, no confirmation sheet (OQ-2 b). */
export function AirtimeFlow() {
  const exit = useExitFlow()
  const nav = useSteps<Step>({ name: 'recipients' })
  const avail = useAvailable()
  const [target, setTarget] = useState<Target | null>(null)
  const [value, setValue] = useState('')
  const [done, setDone] = useState<{ amount: number; date: string } | null>(null)
  const once = useOnce()
  const amount = parseAmount(value)

  const afterOtp = async () => {
    if (!target) return
    await simulate(() => useDemo.getState().spend(airtimeOp(target.name ?? target.phone, target.operator, amount)))
    useUi.getState().showPush(t('payments.airtime.push', { amount: formatNumber(amount), number: target.phone }))
    setDone({ amount, date: receiptDate() })
    nav.replace({ name: 'receipt' })
  }

  const step = nav.step
  let screen
  switch (step.name) {
    case 'recipients':
      screen = (
        <Recipients
          onBack={exit}
          onPick={(tg) => {
            setTarget(tg)
            setValue('')
            nav.push({ name: 'amount' })
          }}
        />
      )
      break
    case 'amount': {
      if (!target) break
      const status = validateAmount(amount, { min: MIN_AMOUNT, max: FLOW_MAX.airtime, available: avail })
      const title = target.name ?? target.phone
      screen = (
        <AmountStep
          testId="airtime-amount"
          gradient={GRADIENT}
          onBack={nav.pop}
          header={{
            leading: target.name ? <Avatar initials={initialsOf(target.name)} color={colorFor(target.name)} /> : <Avatar icon="phone" />,
            title,
            badge: <Badge>{target.operator}</Badge>, // dark badge as in Figma 222:1102
          }}
          value={value}
          onChange={setValue}
          hints={[t('payments.common.balance_hint', { available: formatNumber(avail) })]}
          error={
            status === 'over_max' ? t('payments.airtime.max_amount') : status === 'over_balance' ? t('payments.common.not_enough') : undefined
          }
          chips={CHIPS.airtime}
          offsetTop={84} // room of the hidden Airtime / Data switch (FIGMA_VS_BRD: hide it, keep the spacing)
          button={{ label: t('payments.airtime.continue'), disabled: status !== 'ok', onClick: () => nav.push({ name: 'otp' }) }} // BR-10: OTP directly
        />
      )
      break
    }
    case 'otp':
      screen = <OtpScreen onSuccess={() => once.run(afterOtp)} onCancel={nav.pop} />
      break
    case 'receipt':
      screen = done && target && (
        <Receipt
          testId="airtime-receipt"
          amount={done.amount}
          status={t('payments.airtime.success')}
          blocks={[
            // Blocks as in Figma 222:2075.
            [
              [t('payments.airtime.recipient'), target.name ?? target.phone],
              [t('payments.airtime.number'), target.phone],
            ],
            [
              [t('payments.airtime.operator'), target.operator],
              [t('payments.airtime.paid_from'), paidFromValue()],
            ],
            [[t('payments.airtime.date'), done.date]],
          ]}
          doneLabel={t('payments.common.done')}
          onDone={exit}
        />
      )
      break
  }

  return (
    <div className="absolute inset-0" data-testid="airtime-flow">
      <StepHost stepKey={nav.stepKey} dir={nav.dir}>
        {screen}
      </StepHost>
    </div>
  )
}

function Recipients({ onBack, onPick }: { onBack: () => void; onPick: (t: Target) => void }) {
  useBack(onBack)
  const [query, setQuery] = useState('')

  const view = useMemo(() => {
    const q = query.trim()
    if (!q) return { kind: 'lists' as const }
    const local = completeLocal(q)
    if (local) {
      const phone = toIntl(local)
      const operator = operatorOf(phone)
      if (!operator) return { kind: 'not_found' as const } // Airtime BR-03
      const contact = ALL_CONTACTS.find((c) => c.phone === phone && c !== AIRTIME_MY_NUMBER)
      return { kind: 'number' as const, target: { name: contact?.name ?? null, phone, operator } }
    }
    const needle = q.toLowerCase()
    const digits = digitsOnly(q)
    const match = (c: AirtimeContact) => c.name.toLowerCase().includes(needle) || (digits.length > 0 && digitsOnly(c.phone).includes(digits))
    return { kind: 'filter' as const, items: [...AIRTIME_RECENT, ...AIRTIME_CONTACTS].filter(match) }
  }, [query])

  const row = (c: AirtimeContact, title = c.name, testId = 'airtime-row') => {
    const operator = operatorOf(c.phone) ?? ''
    return (
      <ListRow
        key={c.phone + title}
        testId={testId}
        leading={c === AIRTIME_MY_NUMBER ? <Avatar icon="phone" /> : <Avatar initials={initialsOf(c.name)} color={colorFor(c.name)} />}
        title={title}
        subtitle={t('payments.airtime.row_subtitle', { phone: c.phone, operator })}
        onClick={() => onPick({ name: c === AIRTIME_MY_NUMBER ? t('payments.airtime.my_number') : c.name, phone: c.phone, operator })}
      />
    )
  }

  return (
    <Screen
      testId="airtime-recipients"
      gradient={GRADIENT}
      header={
        <SearchHeader
          title={t('payments.airtime.title')}
          onBack={onBack}
          query={query}
          onQuery={setQuery}
          data-testid="airtime-search"
          placeholder={t('payments.airtime.search_hint')}
          inputMode="text"
        />
      }
    >
      {view.kind === 'lists' && (
        <>
          {row(AIRTIME_MY_NUMBER, t('payments.airtime.my_number'))}
          <div className="h-6" />
          <CapsHeader>{t('payments.airtime.recent')}</CapsHeader>
          {AIRTIME_RECENT.map((c) => row(c))}
          <div className="h-6" />
          <CapsHeader>{t('payments.airtime.contacts')}</CapsHeader>
          {AIRTIME_CONTACTS.map((c) => row(c))}
        </>
      )}
      {view.kind === 'filter' && <div data-testid="airtime-filter">{view.items.map((c) => row(c))}</div>}
      {view.kind === 'number' && (
        <ListRow
          testId="airtime-number-row"
          leading={<Avatar icon="phone" />}
          title={view.target.name ?? view.target.phone}
          subtitle={t('payments.airtime.row_subtitle', { phone: view.target.phone, operator: view.target.operator })}
          onClick={() => onPick(view.target)}
        />
      )}
      {view.kind === 'not_found' && (
        // Figma 243:19982: small mascot, 20/28 title, 13/18 hint.
        <div data-testid="airtime-not-found" className="flex flex-col items-center px-[54px] pt-2 text-center">
          <Illustration kind="notFound" />
          <p className="mt-6 t-display-20">{t('payments.airtime.not_found_title')}</p>
          <p className="mt-[2px] t-regular-13 text-on-bg-secondary">{t('payments.airtime.not_found_hint')}</p>
        </div>
      )}
    </Screen>
  )
}
