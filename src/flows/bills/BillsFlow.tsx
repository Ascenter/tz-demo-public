import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useSteps, StepHost } from '../steps'
import { AmountStep, paidFromValue, receiptDate } from '../shared'
import { useExitFlow, useExitToHome } from '../exit'
import { FundFlow } from '../fund/FundFlow'
import { Screen } from '../../components/Screen'
import { HeaderItem, LargeTitle, NavBar } from '../../components/NavBar'
import { CapsHeader, ListRow } from '../../components/ListRow'
import { SearchField, RedLine } from '../../components/Fields'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { BottomSheet, DetailRows, SheetTitle } from '../../components/BottomSheet'
import { ButtonBar, PrimaryButton } from '../../components/PrimaryButton'
import { ConfirmButton } from '../../components/ConfirmButton'
import { OtpScreen } from '../../components/OtpScreen'
import { Receipt } from '../../components/Receipt'
import { useBack } from '../../app/back'
import { useOnce } from '../../app/once'
import { useUi } from '../../app/ui'
import { useDemo, useAvailable } from '../../app/store'
import { simulate } from '../../engine/delay'
import { validateAmount } from '../../engine/validate'
import { digitsOnly, formatNumber, formatTZS, groupDigits, parseAmount } from '../../engine/format'
import { CHIPS, FLOW_MAX, MIN_AMOUNT } from '../../mock/limits'
import { BILLS } from '../../mock/scripted'
import { BILLERS, SAVED_METER } from '../../mock/billers'
import { lukuOp } from '../../mock/operations'
import { t, type TextKey } from '../../mock/texts'

type Step = { name: 'billers' } | { name: 'meter' } | { name: 'amount' } | { name: 'otp' } | { name: 'receipt' }
type Lookup = 'idle' | 'found' | 'not_found'

const GRADIENT = 'var(--gradient-flow-header-blue)' // Figma: same lilac header as transfers
const LukuAvatar = () => <Avatar icon="flash" color="var(--color-slate-blue)" />
const meterText = (m: string) => groupDigits(m, [4, 4, 3])
const tokenText = (tk: string) => groupDigits(tk, [4, 4, 4, 4, 4])

/** Bill payments, LUKU prepaid electricity (child BRD 3446374638). Done on the receipt opens Home. */
export function BillsFlow() {
  const exit = useExitFlow()
  const toHome = useExitToHome()
  const nav = useSteps<Step>({ name: 'billers' })
  const avail = useAvailable()
  const [meter, setMeter] = useState('')
  const [lookup, setLookup] = useState<Lookup>('idle')
  const [value, setValue] = useState('')
  const [sheet, setSheet] = useState(false)
  const [funding, setFunding] = useState(false)
  const [done, setDone] = useState<{ amount: number; date: string } | null>(null)
  const once = useOnce()
  const amount = parseAmount(value)

  const afterOtp = async () => {
    await simulate(() => useDemo.getState().spend(lukuOp(meter, amount)))
    useUi.getState().showPush(t('payments.bills.push', { amount: formatNumber(amount) }))
    setDone({ amount, date: receiptDate() })
    nav.replace({ name: 'receipt' })
  }

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(BILLS.token) // Bills BR-17: 20 digits, no spaces
    } catch {
      /* clipboard blocked */
    }
    useUi.getState().showToast(t('payments.bills.token_copied'))
  }

  const step = nav.step
  let screen
  switch (step.name) {
    case 'billers':
      screen = (
        <Billers
          onBack={exit}
          onSaved={() => {
            setMeter(SAVED_METER.meter) // Bills BR-04: filled, owner shown, no loader
            setLookup('found')
            nav.push({ name: 'meter' })
          }}
          onLuku={() => {
            setMeter('')
            setLookup('idle')
            nav.push({ name: 'meter' })
          }}
        />
      )
      break
    case 'meter':
      screen = (
        <MeterScreen
          meter={meter}
          lookup={lookup}
          onChange={(m) => {
            setMeter(m)
            setLookup('idle')
          }}
          onLookup={setLookup}
          onBack={nav.pop}
          onContinue={() => {
            setValue('')
            nav.push({ name: 'amount' })
          }}
        />
      )
      break
    case 'amount': {
      // Bills BR-10..12: max 1,000,000 first, then balance → active "Fund my account".
      const status = validateAmount(amount, { min: MIN_AMOUNT, max: FLOW_MAX.bills, available: avail })
      const overBalance = status === 'over_balance'
      screen = (
        <AmountStep
          testId="bills-amount"
          gradient={GRADIENT}
          onBack={nav.pop}
          header={{ leading: <LukuAvatar />, title: BILLS.owner, badge: <Badge>{t('payments.bills.meter_badge', { meter: meterText(meter) })}</Badge> }}
          value={value}
          onChange={setValue}
          hints={[t('payments.common.balance_hint', { available: formatNumber(avail) })]}
          error={
            status === 'over_max'
              ? t('payments.bills.max_amount')
              : overBalance
                ? t('payments.bills.not_enough', { balance: formatNumber(avail) })
                : undefined
          }
          chips={CHIPS.bills}
          button={
            overBalance
              ? { label: t('payments.bills.fund_my_account'), disabled: false, onClick: () => setFunding(true) }
              : { label: t('payments.bills.continue'), disabled: status !== 'ok', onClick: () => setSheet(true) }
          }
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
          testId="bills-receipt"
          amount={done.amount}
          status={t('payments.bills.success')}
          blocks={[
            [
              [t('payments.bills.token'), <span data-testid="luku-token">{tokenText(BILLS.token)}</span>],
              [t('payments.bills.biller'), BILLS.biller],
            ],
            [
              [t('payments.bills.meter_number'), meterText(meter)],
              [t('payments.bills.meter_owner_label'), BILLS.owner],
            ],
            [[t('payments.bills.paid_from'), paidFromValue()]],
            [[t('payments.bills.date'), done.date]],
          ]}
          secondary={{ label: t('payments.bills.copy_token'), onClick: () => void copyToken(), testId: 'copy-token' }}
          doneLabel={t('payments.bills.done')}
          onDone={toHome}
        />
      )
      break
  }

  return (
    <div className="absolute inset-0" data-testid="bills-flow">
      <StepHost stepKey={nav.stepKey} dir={nav.dir}>
        {screen}
      </StepHost>
      <BottomSheet open={sheet} onDismiss={() => setSheet(false)} testId="bills-sheet">
        <SheetTitle title={t('payments.bills.confirm_title')} subtitle={t('payments.bills.confirm_subtitle')} />
        <DetailRows
          rows={[
            [t('payments.bills.meter_number'), meterText(meter)],
            [t('payments.bills.meter_owner_label'), BILLS.owner],
            [t('payments.bills.amount'), formatTZS(amount)],
            [t('payments.bills.fee'), t('payments.common.no_fee')],
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
            {t('payments.bills.buy_token')}
          </ConfirmButton>
          <PrimaryButton variant="nobg" data-testid="sheet-cancel" onClick={() => setSheet(false)}>
            {t('payments.bills.cancel')}
          </PrimaryButton>
        </div>
      </BottomSheet>
      {/* Bills BR-13: Fund my account on top; every exit returns here with the amount cleared. */}
      <AnimatePresence>
        {funding && (
          <motion.div
            className="absolute inset-0 z-20"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', ease: [0.32, 0.72, 0, 1], duration: 0.38 }}
          >
            <FundFlow
              onExit={() => {
                setValue('')
                setFunding(false)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Billers({ onBack, onSaved, onLuku }: { onBack: () => void; onSaved: () => void; onLuku: () => void }) {
  useBack(onBack)
  return (
    <Screen
      testId="bills-billers"
      gradient={GRADIENT}
      header={
        <>
          <NavBar onBack={onBack} />
          <LargeTitle title={t('payments.bills.title')} />
          <div className="pb-6">
            <SearchField inactive placeholder={t('payments.bills.search_hint')} />
          </div>
        </>
      }
    >
      <CapsHeader>{t('payments.bills.saved')}</CapsHeader>
      <ListRow
        testId="bills-saved-meter"
        leading={<Avatar icon="flash" color={SAVED_METER.color} />}
        title={SAVED_METER.owner}
        subtitle={t('payments.bills.saved_meter_subtitle', { meter: meterText(SAVED_METER.meter) })}
        onClick={onSaved}
      />
      <div className="h-6" />
      <CapsHeader>{t('payments.bills.all_billers')}</CapsHeader>
      {BILLERS.map((b) => (
        <ListRow
          key={b.id}
          testId={`biller-${b.id}`}
          icon={b.icon}
          avatarColor={b.color}
          title={t(b.titleKey as TextKey)}
          subtitle={t(b.subtitleKey as TextKey)}
          below={b.active ? undefined : <Badge tone="custom" color="var(--color-on-bg-secondary)">{t('payments.bills.soon')}</Badge>}
          dimmed={!b.active}
          onClick={b.active ? onLuku : undefined} // Bills BR-02: Soon billers do not open
        />
      ))}
    </Screen>
  )
}

/** Meter number: on the 11th digit the lookup runs behind the loader (Bills BR-05..07). */
function MeterScreen(props: {
  meter: string
  lookup: Lookup
  onChange: (m: string) => void
  onLookup: (l: Lookup) => void
  onBack: () => void
  onContinue: () => void
}) {
  const { meter, lookup, onChange, onLookup, onBack, onContinue } = props
  useBack(onBack)
  const ran = useRef<string | null>(lookup === 'idle' ? null : meter)

  useEffect(() => {
    if (meter.length !== 11 || lookup !== 'idle' || ran.current === meter) return
    ran.current = meter
    void simulate(() => (meter === BILLS.meter ? 'found' : 'not_found')).then((r) => onLookup(r))
  }, [meter, lookup, onLookup])

  return (
    <Screen
      testId="bills-meter"
      gradient={GRADIENT}
      header={
        <>
          <NavBar onBack={onBack} />
          <HeaderItem leading={<LukuAvatar />} title={t('payments.bills.meter_title')} subtitle={t('payments.bills.luku_subtitle')} />
        </>
      }
      footer={
        <ButtonBar>
          <PrimaryButton data-testid="meter-continue" disabled={lookup !== 'found'} onClick={onContinue}>
            {t('payments.bills.continue')}
          </PrimaryButton>
        </ButtonBar>
      }
    >
      <CapsHeader>{t('payments.bills.meter_label')}</CapsHeader>
      <div className="flex flex-col gap-2 px-5">
        <input
          data-testid="meter-input"
          inputMode="numeric"
          autoComplete="off"
          placeholder={t('payments.bills.meter_placeholder')}
          value={meterText(meter)}
          onChange={(e) => {
            const m = digitsOnly(e.target.value).slice(0, 11)
            if (m !== meter) {
              ran.current = null
              onChange(m)
            }
          }}
          className="h-14 rounded-field bg-field-bg px-4 font-display text-[24px] font-semibold tracking-[1px] outline-none placeholder:text-black/20"
        />
        {lookup === 'found' && (
          <p data-testid="meter-owner" className="t-regular-13 text-on-bg-secondary">
            {t('payments.bills.meter_owner', { name: BILLS.owner })}
          </p>
        )}
        {lookup === 'not_found' && <RedLine>{t('payments.bills.meter_not_found')}</RedLine>}
      </div>
    </Screen>
  )
}
