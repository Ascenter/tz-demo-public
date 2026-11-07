import { useState } from 'react'
import { useSteps, StepHost } from '../steps'
import { paidFromValue, receiptDate } from '../shared'
import { useExitFlow, useExitToHome } from '../exit'
import { Screen } from '../../components/Screen'
import { HeaderItem, LargeTitle, NavBar } from '../../components/NavBar'
import { CapsHeader, ListRow } from '../../components/ListRow'
import { SearchField, RedLine } from '../../components/Fields'
import { Avatar } from '../../components/Avatar'
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
import { digitsOnly, formatNumber, formatTZS, groupDigits } from '../../engine/format'
import { GOV } from '../../mock/scripted'
import { INSTITUTIONS, TRA } from '../../mock/institutions'
import { govOp } from '../../mock/operations'
import { t, type TextKey } from '../../mock/texts'

type Step = { name: 'institutions' } | { name: 'control' } | { name: 'otp' } | { name: 'receipt' }

const GRADIENT = 'var(--gradient-transfer)' // Figma: same lilac header as transfers
const GovAvatar = () => <Avatar icon={TRA.icon} color={TRA.color} />

/** Government bill via GePG (child BRD 3447390224). Done on the receipt opens Home (BR-09). */
export function GovFlow() {
  const exit = useExitFlow()
  const toHome = useExitToHome()
  const nav = useSteps<Step>({ name: 'institutions' })
  const [control, setControl] = useState('')
  const [date, setDate] = useState('')
  const [bill, setBill] = useState(false)
  const once = useOnce()

  const afterOtp = async () => {
    await simulate(() => useDemo.getState().spend(govOp()))
    useUi.getState().showPush(t('payments.common.push_sent', { amount: formatNumber(GOV.amount), name: t('payments.gov.push_name') }))
    setDate(receiptDate())
    nav.replace({ name: 'receipt' })
  }

  const copyReceipt = async () => {
    try {
      await navigator.clipboard.writeText(GOV.receipt)
    } catch {
      /* clipboard blocked: the toast still confirms the scripted action */
    }
    useUi.getState().showToast(t('payments.gov.copied'))
  }

  const step = nav.step
  let screen
  switch (step.name) {
    case 'institutions':
      screen = (
        <Institutions
          onBack={exit}
          onTra={() => {
            setControl('')
            nav.push({ name: 'control' })
          }}
        />
      )
      break
    case 'control':
      screen = <ControlNumber value={control} onChange={setControl} onBack={nav.pop} onContinue={() => setBill(true)} />
      break
    case 'otp':
      screen = <OtpScreen onSuccess={() => once.run(afterOtp)} onCancel={nav.pop} />
      break
    case 'receipt':
      screen = (
        <Receipt
          testId="gov-receipt"
          amount={GOV.amount}
          status={t('payments.gov.success')}
          blocks={[
            [
              [t('payments.gov.institution'), GOV.institution],
              [t('payments.gov.bill'), GOV.bill],
              [t('payments.gov.control_number_label'), groupDigits(control, [4, 4, 4])],
            ],
            [[t('payments.gov.gepg_receipt'), <span data-testid="gepg-receipt">{GOV.receipt}</span>]],
            [
              [t('payments.gov.paid_from'), paidFromValue()],
              [t('payments.gov.date'), date],
            ],
          ]}
          doneLabel={t('payments.gov.done')}
          secondary={{ label: t('payments.gov.copy_receipt'), onClick: () => void copyReceipt(), testId: 'copy-receipt' }}
          onDone={toHome}
        />
      )
      break
  }

  return (
    <div className="absolute inset-0" data-testid="gov-flow">
      <StepHost stepKey={nav.stepKey} dir={nav.dir}>
        {screen}
      </StepHost>
      <BillCheck
        open={bill}
        control={control}
        onCancel={() => setBill(false)} // Cancel → control number screen, number kept
        onPay={() => {
          setBill(false)
          nav.push({ name: 'otp' })
        }}
      />
    </div>
  )
}

function Institutions({ onBack, onTra }: { onBack: () => void; onTra: () => void }) {
  useBack(onBack)
  return (
    <Screen
      testId="gov-institutions"
      gradient={GRADIENT}
      header={
        <>
          <NavBar onBack={onBack} />
          <LargeTitle title={t('payments.gov.title')} />
          <div className="pb-6">
            <SearchField inactive placeholder={t('payments.gov.search_hint')} />
          </div>
        </>
      }
    >
      <CapsHeader>{t('payments.gov.institutions')}</CapsHeader>
      {INSTITUTIONS.map((i) => (
        <ListRow
          key={i.id}
          testId={`inst-${i.id}`}
          icon={i.icon}
          avatarColor={i.color}
          title={t(`payments.gov.inst.${i.id}` as TextKey)}
          subtitle={t(`payments.gov.inst.${i.id}_subtitle` as TextKey)}
          onClick={i.active ? onTra : undefined} // Gov BR-02: only TRA tax opens
        />
      ))}
    </Screen>
  )
}

/** Gov BR-03..05: digits only, exactly 12, grouped 4-4-4. */
function ControlNumber({ value, onChange, onBack, onContinue }: { value: string; onChange: (v: string) => void; onBack: () => void; onContinue: () => void }) {
  useBack(onBack)
  const complete = value.length === 12
  const found = complete && value === GOV.controlNumber
  return (
    <Screen
      testId="gov-control"
      gradient={GRADIENT}
      header={
        <>
          <NavBar onBack={onBack} />
          <HeaderItem leading={<GovAvatar />} title={t('payments.gov.inst.tra')} subtitle={t('payments.gov.inst.tra_subtitle')} />
        </>
      }
      footer={
        <ButtonBar>
          <PrimaryButton data-testid="gov-continue" disabled={!found} onClick={onContinue}>
            {t('payments.gov.continue')}
          </PrimaryButton>
        </ButtonBar>
      }
    >
      <CapsHeader>{t('payments.gov.control_number')}</CapsHeader>
      <div className="flex flex-col gap-2 px-5">
        <input
          data-testid="gov-control-input"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          placeholder={t('payments.gov.control_number_placeholder')}
          value={groupDigits(value, [4, 4, 4])}
          onChange={(e) => onChange(digitsOnly(e.target.value).slice(0, 12))}
          className="h-14 rounded-field bg-tertiary-bg px-4 font-display text-[24px] font-semibold tracking-[1px] outline-none placeholder:text-black/20"
        />
        {complete &&
          (found ? (
            <p data-testid="gov-found" className="text-caption text-secondary">
              {t('payments.gov.found', { institution: GOV.institution, payer: GOV.payer })}
            </p>
          ) : (
            <RedLine>{t('payments.gov.not_found')}</RedLine>
          ))}
      </div>
    </Screen>
  )
}

/** "Pay this bill" sheet (Figma 239:5938): amount is read-only (Gov BR-06). */
function BillCheck({ open, control, onCancel, onPay }: { open: boolean; control: string; onCancel: () => void; onPay: () => void }) {
  const avail = useAvailable()
  const enough = GOV.amount <= avail
  return (
    <BottomSheet open={open} onDismiss={onCancel} testId="gov-bill">
      <SheetTitle title={t('payments.gov.check_title')} subtitle={t('payments.gov.check_subtitle')} />
      <DetailRows
        rows={[
          [t('payments.gov.institution'), GOV.institution],
          [t('payments.gov.payer'), GOV.payer],
          [t('payments.gov.bill'), GOV.bill],
          [t('payments.gov.control_number_label'), groupDigits(control, [4, 4, 4])],
          [t('payments.gov.pay_by'), GOV.payBy],
          [t('payments.gov.amount'), formatTZS(GOV.amount)],
          [t('payments.gov.fee'), t('payments.common.no_fee')],
          [t('payments.gov.from_account'), t('payments.gov.from_account_value', { available: formatNumber(avail) })],
        ]}
      />
      <div className="flex flex-col gap-[10px]">
        {!enough && <RedLine>{t('payments.common.not_enough')}</RedLine>}
        <ConfirmButton data-testid="gov-pay" disabled={!enough} onClick={onPay}>
          {t('payments.gov.pay', { amount: formatNumber(GOV.amount) })}
        </ConfirmButton>
        <PrimaryButton variant="nobg" data-testid="gov-cancel" onClick={onCancel}>
          {t('payments.gov.cancel')}
        </PrimaryButton>
      </div>
    </BottomSheet>
  )
}
