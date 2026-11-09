import { useState } from 'react'
import { Screen } from '../../components/Screen'
import { LargeTitle, NavBar } from '../../components/NavBar'
import { TextField } from '../../components/Fields'
import { ButtonBar, PrimaryButton } from '../../components/PrimaryButton'
import { useBack } from '../../app/back'
import { useDemo } from '../../app/store'
import { useUi } from '../../app/ui'
import { t } from '../../mock/texts'
import type { SendRecipient } from '../../mock/recipients'
import { maskAccountMiddle } from '../shared'

/** Send S3: save the recipient to the address book (Figma 19:7357). Name required; bank and account read-only. */
export function SaveContact({ recipient, onBack, onSaved }: { recipient: SendRecipient; onBack: () => void; onSaved: () => void }) {
  useBack(onBack)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState(recipient.phone ?? '')
  const save = () => {
    useDemo.getState().saveContact(recipient.account, name.trim(), phone.trim() || undefined) // Send BR-07
    useUi.getState().showToast(t('payments.send_money.contact_saved'))
    onSaved()
  }
  return (
    <Screen
      testId="send-save-contact"
      header={
        <>
          <NavBar onBack={onBack} />
          <LargeTitle title={t('payments.send_money.save_contact')} />
        </>
      }
      footer={
        <ButtonBar>
          <PrimaryButton data-testid="save-contact-save" disabled={!name.trim()} onClick={save}>
            {t('payments.send_money.save')}
          </PrimaryButton>
        </ButtonBar>
      }
    >
      <div className="flex flex-col gap-5 px-5">
        <TextField data-testid="contact-name" label={t('payments.send_money.contact_name')} value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
        <TextField data-testid="contact-phone" label={t('payments.send_money.mobile_optional')} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
        <TextField label={t('payments.send_money.bank')} readOnlyValue={recipient.bank} />
        <TextField label={t('payments.send_money.account_number')} readOnlyValue={maskAccountMiddle(recipient.account)} />
      </div>
    </Screen>
  )
}
