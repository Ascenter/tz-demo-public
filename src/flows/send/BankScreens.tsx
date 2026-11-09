import { useState } from 'react'
import { Screen } from '../../components/Screen'
import { LargeTitle, NavBar } from '../../components/NavBar'
import { CapsHeader, ListRow } from '../../components/ListRow'
import { SearchField, TextField } from '../../components/Fields'
import { Avatar, colorFor, initialsOf } from '../../components/Avatar'
import { ButtonBar, PrimaryButton } from '../../components/PrimaryButton'
import { useBack } from '../../app/back'
import { simulateInline } from '../../engine/delay'
import { Spinner } from '../../components/Loader'
import { digitsOnly } from '../../engine/format'
import { BANKS, BANK_COLORS, BANK_INITIALS } from '../../mock/banks'
import { SEND } from '../../mock/scripted'
import { t } from '../../mock/texts'
import type { SendRecipient } from '../../mock/recipients'
import { SEND_GRADIENT } from './RecipientsScreen'

/** TIPS: "Select bank" (Figma 42:5319). */
export function SelectBank({ onBack, onPick }: { onBack: () => void; onPick: (bank: string) => void }) {
  useBack(onBack)
  return (
    <Screen
      testId="send-banks"
      gradient={SEND_GRADIENT}
      header={
        <>
          <NavBar onBack={onBack} />
          <LargeTitle title={t('payments.send_money.select_bank')} tight />
          {/* Search as drawn in Figma 42:5319; the demo list is short, so it is shown but inactive. */}
          <div className="pb-[34px]">
            <SearchField inactive placeholder={t('payments.send_money.bank_search_hint')} />
          </div>
        </>
      }
    >
      <CapsHeader>{t('payments.send_money.banks')}</CapsHeader>
      {BANKS.map((b) => (
        <ListRow key={b} testId={`bank-${b}`} leading={<Avatar initials={BANK_INITIALS[b]} color={BANK_COLORS[b]} />} title={b} onClick={() => onPick(b)} />
      ))}
    </Screen>
  )
}

/** TIPS: "Bank transfer" form + scripted name check (Send S2, BR-09). */
export function BankForm({ bank, onBack, onContinue }: { bank: string; onBack: () => void; onContinue: (r: SendRecipient) => void }) {
  useBack(onBack)
  const [account, setAccount] = useState('')
  const [name, setName] = useState('')
  const [checked, setChecked] = useState(false)
  const ready = digitsOnly(account).length >= 10 && name.trim().length >= 2

  const [checking, setChecking] = useState(false)
  const check = async () => {
    // Send BR-10: the TIPS name check shows a loader — the gradient spinner in the button (Figma 43:7309).
    setChecking(true)
    await simulateInline(() => null)
    setChecking(false)
    setChecked(true)
  }
  const edit = (fn: (v: string) => void) => (v: string) => {
    fn(v)
    setChecked(false)
  }

  return (
    <Screen
      testId="send-bank-form"
      gradient={SEND_GRADIENT}
      header={<><NavBar onBack={onBack} /><LargeTitle title={t('payments.send_money.bank_transfer_title')} subtitle={t('payments.send_money.bank_transfer_subtitle')} /></>}
      footer={
        <ButtonBar>
          <PrimaryButton
            data-testid="bank-continue"
            disabled={!ready || checking}
            onClick={() =>
              checked
                ? onContinue({ account: digitsOnly(account), name: SEND.tipsNameAtBank, bank, kind: 'tips' })
                : void check()
            }
          >
            {checking ? <Spinner /> : t('payments.send_money.continue')}
          </PrimaryButton>
        </ButtonBar>
      }
    >
      <div className="flex flex-col gap-5 px-5 pt-[10px]">
        <TextField label={t('payments.send_money.bank')} readOnlyValue={bank} chevron />
        <TextField
          data-testid="bank-account"
          label={t('payments.send_money.account_number')}
          inputMode="numeric"
          autoComplete="off"
          value={account}
          onChange={(e) => edit(setAccount)(e.target.value.replace(/[^\d ]/g, ''))}
        />
        <TextField
          data-testid="bank-name"
          label={t('payments.send_money.recipient_name')}
          autoComplete="off"
          value={name}
          onChange={(e) => edit(setName)(e.target.value)}
        />
      </div>
      {checked && (
        <div className="pt-6" data-testid="name-check">
          <CapsHeader>{t('payments.send_money.name_at_bank', { bank })}</CapsHeader>
          <ListRow
            leading={
              // Figma 43:6975: initials of the name the customer typed.
              <Avatar initials={initialsOf(name)} color={colorFor(name)} />
            }
            title={SEND.tipsNameAtBank}
            subtitle={t('payments.send_money.name_matches')}
          />
        </div>
      )}
    </Screen>
  )
}
