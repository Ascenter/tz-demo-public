import { useCallback, useMemo, useState } from 'react'
import { useSteps, StepHost } from '../steps'
import { AmountStep, paidFromValue, receiptDate } from '../shared'
import { useExitFlow } from '../exit'
import { completeLocal, formatTyped, maxTypedDigits, operatorOf, toIntl } from './numbers'
import { Screen } from '../../components/Screen'
import { CapsHeader, ListRow } from '../../components/ListRow'
import { SearchHeader } from '../../components/SearchHeader'
import { LargeTitle, NavBar } from '../../components/NavBar'
import { Illustration } from '../../components/Illustration'
import { Avatar, colorFor, initialsOf } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { Keypad } from '../../components/Keypad'
import { MiniButton, PrimaryButton, ButtonBar } from '../../components/PrimaryButton'
import { RedLine, TextField } from '../../components/Fields'
import { OtpScreen } from '../../components/OtpScreen'
import { Receipt } from '../../components/Receipt'
import PlusBlack40 from '../../assets/icons/ic_plusBlack_40.svg?react'
import { useBack } from '../../app/back'
import { useOnce } from '../../app/once'
import { useUi } from '../../app/ui'
import { useDemo, useAvailable } from '../../app/store'
import { simulate } from '../../engine/delay'
import { validateAmount } from '../../engine/validate'
import { digitsOnly, formatNumber, parseAmount } from '../../engine/format'
import { CHIPS, FLOW_MAX, MIN_AMOUNT } from '../../mock/limits'
import { AIRTIME_MY_NUMBER, type AirtimeContact } from '../../mock/recipients'
import { airtimeOp } from '../../mock/operations'
import { t } from '../../mock/texts'

interface Target {
  /** Contact name, or null for a typed number that is not a contact (Airtime BR-05) until it is saved (BR-15). */
  name: string | null
  phone: string
  operator: string
}

type Step = { name: 'recipients' } | { name: 'enter' } | { name: 'amount' } | { name: 'otp' } | { name: 'receipt' } | { name: 'save' }

const GRADIENT = 'var(--gradient-flow-header-blue)' // Figma: same lilac header as transfers
const NEW_NUMBER_COLOR = 'var(--color-blue-ocean)' // phone icon of a typed number (Figma 518:5292)

/** Contact behind a complete number: My number, Recent or Contacts (Airtime BR-03, BR-19); null = a new number. */
function targetFor(phone: string, operator: string): Target {
  if (phone === AIRTIME_MY_NUMBER.phone) return { name: t('payments.airtime.my_number'), phone, operator }
  const { airtimeRecent, airtimeContacts } = useDemo.getState()
  const contact = [...airtimeRecent, ...airtimeContacts].find((c) => c.phone === phone)
  return { name: contact?.name ?? null, phone, operator }
}

/** Phone icon for My number and typed numbers, initials for contacts. */
function leadingFor(name: string | null, phone: string) {
  if (phone === AIRTIME_MY_NUMBER.phone) return <Avatar icon="phone" />
  if (!name) return <Avatar icon="phone" color={NEW_NUMBER_COLOR} />
  return <Avatar initials={initialsOf(name)} color={colorFor(name)} />
}

/**
 * Airtime (child BRD 3437592577 v6): recipients with "Enter phone number", search with "New number",
 * Save contact from the receipt. No Airtime/Data switch, no confirmation sheet (OQ-2 b).
 */
export function AirtimeFlow() {
  const exit = useExitFlow()
  const nav = useSteps<Step>({ name: 'recipients' })
  const avail = useAvailable()
  const [target, setTarget] = useState<Target | null>(null)
  const [typed, setTyped] = useState('') // Enter number screen digits; kept while the amount screen is open
  const [value, setValue] = useState('')
  const [done, setDone] = useState<{ amount: number; date: string } | null>(null)
  const once = useOnce()
  const amount = parseAmount(value)

  const openAmount = (tg: Target) => {
    setTarget(tg)
    setValue('') // the typed amount is not kept (Airtime navigation)
    nav.push({ name: 'amount' })
  }

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
          onEnterNumber={() => {
            setTyped('')
            nav.push({ name: 'enter' })
          }}
          onPick={openAmount}
        />
      )
      break
    case 'enter':
      screen = (
        <EnterNumber
          digits={typed}
          onChange={setTyped}
          onBack={() => {
            setTyped('') // number not kept (Airtime navigation)
            nav.pop()
          }}
          onContinue={openAmount}
        />
      )
      break
    case 'amount': {
      if (!target) break
      const status = validateAmount(amount, { min: MIN_AMOUNT, max: FLOW_MAX.airtime, available: avail })
      screen = (
        <AmountStep
          testId="airtime-amount"
          gradient={GRADIENT}
          onBack={nav.pop}
          header={{
            leading: leadingFor(target.name, target.phone),
            title: target.name ?? target.phone,
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
            // Blocks as in Figma 222:2075; a number that is not a contact has no Recipient row and the
            // "Save contact" chip under the number (Airtime BR-13, Figma 518:6442 / 524:6844).
            [
              [t('payments.airtime.recipient'), target.name ?? undefined],
              [
                t('payments.airtime.number'),
                target.name ? (
                  target.phone
                ) : (
                  <span className="flex flex-col items-start gap-3">
                    <span>{target.phone}</span>
                    <MiniButton testId="airtime-save-contact" onClick={() => nav.push({ name: 'save' })}>
                      {t('payments.airtime.save_contact')}
                    </MiniButton>
                  </span>
                ),
              ],
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
    case 'save':
      screen = target && (
        <SaveContact
          phone={target.phone}
          onBack={nav.pop}
          onSaved={(c) => {
            useDemo.getState().saveAirtimeContact(c) // BR-15: Contacts, Recent first, feed shows the name
            setTarget({ ...target, name: c.name })
            nav.pop()
          }}
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

function Recipients({ onBack, onPick, onEnterNumber }: { onBack: () => void; onPick: (t: Target) => void; onEnterNumber: () => void }) {
  useBack(onBack)
  const [query, setQuery] = useState('')
  const recent = useDemo((s) => s.airtimeRecent)
  const contacts = useDemo((s) => s.airtimeContacts)

  const view = useMemo(() => {
    const q = query.trim()
    if (!q) return { kind: 'lists' as const }
    const local = completeLocal(q)
    if (local) {
      const phone = toIntl(local)
      const operator = operatorOf(phone)
      if (!operator) return { kind: 'not_found' as const } // Airtime BR-03
      return { kind: 'number' as const, target: targetFor(phone, operator) }
    }
    // BR-04: until the number is complete, only matching contacts (one row per number).
    const needle = q.toLowerCase()
    const digits = digitsOnly(q)
    const match = (c: AirtimeContact) => c.name.toLowerCase().includes(needle) || (digits.length > 0 && digitsOnly(c.phone).includes(digits))
    const all = [...recent, ...contacts].filter((c, i, list) => list.findIndex((x) => x.phone === c.phone) === i)
    return { kind: 'filter' as const, items: all.filter(match) }
  }, [query, recent, contacts])

  // BR-02: name and number only; the operator shows on the amount screen and the receipt.
  const row = (c: AirtimeContact, title = c.name, testId = 'airtime-row') => (
    <ListRow
      key={c.phone + title}
      testId={testId}
      leading={leadingFor(c === AIRTIME_MY_NUMBER ? null : c.name, c.phone)}
      title={title}
      subtitle={c.phone}
      onClick={() => onPick(targetFor(c.phone, operatorOf(c.phone) ?? ''))}
    />
  )

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
          {/* BR-17: "Enter phone number" first, then a divider (Figma 541:6387). */}
          <ListRow
            testId="airtime-enter-number"
            leading={<PlusBlack40 width={40} height={40} aria-hidden="true" className="text-on-bg-primary" />}
            title={t('payments.airtime.enter_number')}
            onClick={onEnterNumber}
          />
          <div className="mx-5 h-px shrink-0 bg-border-unselected" style={{ transform: 'scaleY(0.5)' }} />
          <div className="h-6 shrink-0" />
          {row(AIRTIME_MY_NUMBER, t('payments.airtime.my_number'))}
          <div className="h-6 shrink-0" />
          <CapsHeader>{t('payments.airtime.recent')}</CapsHeader>
          <div data-testid="airtime-recent">{recent.map((c) => row(c))}</div>
          <div className="h-6 shrink-0" />
          <CapsHeader>{t('payments.airtime.contacts')}</CapsHeader>
          <div data-testid="airtime-contacts">{contacts.map((c) => row(c))}</div>
        </>
      )}
      {view.kind === 'filter' && <div data-testid="airtime-filter">{view.items.map((c) => row(c))}</div>}
      {view.kind === 'number' &&
        (view.target.name ? (
          <ListRow
            testId="airtime-number-row"
            leading={leadingFor(view.target.name, view.target.phone)}
            title={view.target.name}
            subtitle={view.target.phone}
            onClick={() => onPick(view.target)}
          />
        ) : (
          // BR-03: a number that is not a contact → one row under "New number", phone icon, no operator.
          <>
            <CapsHeader testId="airtime-new-number-title">{t('payments.airtime.new_number')}</CapsHeader>
            <ListRow
              testId="airtime-number-row"
              leading={leadingFor(null, view.target.phone)}
              title={view.target.phone}
              onClick={() => onPick(view.target)}
            />
          </>
        ))}
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

/**
 * Enter number screen (Airtime S5, BR-17–BR-19, Figma 518:5041): one large number (FFTextInput 32/40) on the
 * sheet, Continue above the in-app keypad. An unknown prefix shows the red line "Number not found" (BR-19).
 */
function EnterNumber({
  digits,
  onChange,
  onBack,
  onContinue,
}: {
  digits: string
  onChange: (d: string) => void
  onBack: () => void
  onContinue: (t: Target) => void
}) {
  useBack(onBack)
  const local = completeLocal(digits.startsWith('255') ? `+${digits}` : digits)
  const phone = local ? toIntl(local) : null
  const operator = phone ? operatorOf(phone) : null
  const notFound = phone !== null && !operator

  const onDigit = useCallback(
    (d: string) => {
      const next = digits + d
      if (next.length <= maxTypedDigits(next)) onChange(next)
    },
    [digits, onChange],
  )
  const onDelete = useCallback(() => onChange(digits.slice(0, -1)), [digits, onChange])

  return (
    <Screen
      testId="airtime-enter"
      gradient={GRADIENT}
      scroll={false}
      sheetPadding={false}
      header={
        <>
          <NavBar onBack={onBack} />
          <LargeTitle title={t('payments.airtime.title')} />
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Number centred at y = 299 (145 pt under the sheet top), Continue 20 pt above the keypad. */}
        <div className="flex min-h-[120px] flex-1 flex-col items-center px-5 pt-[145px]">
          <div className="flex h-10 items-center gap-[2px]" data-testid="airtime-enter-display">
            <span data-testid="airtime-enter-value" className="whitespace-nowrap t-display-32 tracking-[0.384px] text-on-bg-primary">
              {formatTyped(digits)}
            </span>
            <span className="caret h-10 w-[2px] rounded bg-on-bg-primary" />
          </div>
          {notFound && (
            <div className="mt-3">
              <RedLine>{t('payments.airtime.not_found_title')}</RedLine>
            </div>
          )}
        </div>
        <div className="px-5 py-[10px]">
          <PrimaryButton
            data-testid="airtime-enter-continue"
            disabled={!phone || !operator}
            onClick={() => phone && operator && onContinue(targetFor(phone, operator))}
          >
            {t('payments.airtime.continue')}
          </PrimaryButton>
        </div>
        <Keypad onDigit={onDigit} onDelete={onDelete} />
      </div>
    </Screen>
  )
}

/**
 * Save contact (Airtime S4/S5, BR-14–BR-16, Figma 518:7536): Contact name typed, Mobile number prefilled and fixed.
 * Saves to the app's data only; "Add to existing contact" is hidden in the demo build (OQ-3 a).
 */
function SaveContact({ phone, onBack, onSaved }: { phone: string; onBack: () => void; onSaved: (c: AirtimeContact) => void }) {
  useBack(onBack)
  const [name, setName] = useState('')
  const valid = name.trim().length > 0
  return (
    <Screen
      testId="airtime-save"
      header={
        <>
          <NavBar onBack={onBack} />
          <LargeTitle title={t('payments.airtime.save_contact')} />
        </>
      }
      footer={
        <ButtonBar>
          <PrimaryButton data-testid="airtime-save-button" disabled={!valid} onClick={() => onSaved({ name: name.trim(), phone })}>
            {t('payments.airtime.save')}
          </PrimaryButton>
        </ButtonBar>
      }
    >
      <div className="flex flex-col gap-3 px-5">
        <TextField
          data-testid="airtime-contact-name"
          label={t('payments.airtime.contact_name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="off"
          enterKeyHint="done"
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        />
        <TextField
          data-testid="airtime-contact-phone"
          label={t('payments.airtime.mobile_number')}
          value={phone}
          readOnly
          tabIndex={-1}
          onFocus={(e) => e.currentTarget.blur()}
        />
      </div>
    </Screen>
  )
}
