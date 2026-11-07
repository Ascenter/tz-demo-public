import { useNavigate } from 'react-router'
import { CapsHeader, ListRow } from '../components/ListRow'
import { LargeTitle } from '../components/NavBar'
import { t } from '../mock/texts'

/** Payments (Figma 1:4211). */
export function Payments() {
  const navigate = useNavigate()
  const go = (to: string) => () => navigate(to, { state: { origin: '/payments' } })
  return (
    <div className="scroll-y absolute inset-0" data-testid="payments">
      <div className="relative min-h-full">
        <div className="absolute inset-x-0 top-0 h-[260px]" style={{ background: 'var(--gradient-payments)' }} />
        <div className="relative" style={{ paddingTop: 'calc(var(--safe-top) + 52px)' }}>
          <LargeTitle title={t('payments.title')} />
        </div>
        <div className="relative min-h-[720px] rounded-t-container bg-surface pb-32 pt-3">
          <CapsHeader>{t('payments.transfers')}</CapsHeader>
          <ListRow testId="pay-send" icon="arrowRight" avatarColor="#7a80ff" title={t('payments.send_money.title')} subtitle={t('payments.send_money.entry_subtitle')} onClick={go('/send')} />
          <ListRow testId="pay-fund" icon="plus" avatarColor="#000" title={t('payments.fund_account.action')} subtitle={t('payments.fund_account.entry_subtitle')} onClick={go('/fund')} />
          <ListRow testId="pay-cash" icon="wallet" avatarColor="#88c758" title={t('payments.cash_withdrawal.entry')} subtitle={t('payments.cash_withdrawal.entry_subtitle')} onClick={go('/cash')} />
          <div className="h-6" />
          <CapsHeader>{t('payments.service_payments')}</CapsHeader>
          <ListRow testId="pay-airtime" icon="phone" avatarColor="#39cc7e" title={t('payments.airtime.entry')} subtitle={t('payments.airtime.entry_subtitle')} onClick={go('/airtime')} />
          <ListRow testId="pay-bills" icon="home" avatarColor="#4bc5eb" title={t('payments.bills.entry')} subtitle={t('payments.bills.entry_subtitle')} onClick={go('/bills')} />
          <ListRow testId="pay-gov" icon="gov" avatarColor="#c7c758" title={t('payments.gov.entry')} subtitle={t('payments.gov.entry_subtitle')} onClick={go('/gov')} />
          <ListRow testId="pay-scan" icon="qr" avatarColor="#566dcc" title={t('payments.scan_to_pay.payments_entry')} subtitle={t('payments.scan_to_pay.payments_entry_subtitle')} onClick={go('/scan')} />
        </div>
      </div>
    </div>
  )
}
