import { useRef } from 'react'
import { useNavigate } from 'react-router'
import { useDemo } from '../app/store'
import { useUi } from '../app/ui'
import { available } from '../engine/money'
import { formatNumber, formatTZS } from '../engine/format'
import { RoundIcon52, type IconName } from '../components/icons'
import { t, type TextKey } from '../mock/texts'
import { Feed } from './Feed'

/** Home (Figma 1:3556): balance, quick actions, card, feed. */
export function Home() {
  const navigate = useNavigate()
  const ledger = useDemo((s) => s.ledger)
  const press = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Hidden demo menu: long-press (≥ 1 s) on the balance.
  const startPress = () => {
    press.current = setTimeout(() => useUi.getState().setDemoMenu(true), 1000)
  }
  const endPress = () => {
    if (press.current) clearTimeout(press.current)
    press.current = null
  }

  const actions: { icon: IconName; label: TextKey; to: string }[] = [
    { icon: 'plus', label: 'home.fund_my_account', to: '/fund' },
    { icon: 'arrowRight', label: 'home.send_money', to: '/send' },
    { icon: 'qr', label: 'home.scan_to_pay', to: '/scan' },
  ]

  return (
    <div className="scroll-y absolute inset-0" data-testid="home">
      <div className="relative min-h-full">
        <div className="absolute inset-x-0 top-0 h-[460px]" style={{ background: 'var(--gradient-home)' }} />
        <div className="relative" style={{ paddingTop: 'calc(var(--safe-top) + 60px)' }}>
          <div
            data-testid="balance"
            className="flex flex-col items-center gap-[2px]"
            onPointerDown={startPress}
            onPointerUp={endPress}
            onPointerLeave={endPress}
            onPointerCancel={endPress}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* Figma 176:4682 (8 Nov): currency first, same size as the amount (parent BR-14). */}
            <div className="flex w-full items-end justify-start px-[25px] font-display text-main-amount font-normal">
              <span>TZS&nbsp;</span>
              <span data-testid="balance-available">{formatNumber(available(ledger))}</span>
            </div>
            <div className="flex gap-2 text-caption text-secondary">
              <div className="flex flex-col items-start">
                <span>{t('home.personal_funds')}</span>
                <span>{t('home.credit_limit')}</span>
              </div>
              <div className="flex flex-col items-end">
                <span data-testid="balance-own">{formatTZS(ledger.ownFunds)}</span>
                <span data-testid="balance-credit">{formatTZS(ledger.creditLimit)}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex">
            {actions.map((a) => (
              <button
                key={a.to}
                type="button"
                data-testid={`quick-${a.to.slice(1)}`}
                onClick={() => navigate(a.to, { state: { origin: '/' } })}
                className="pressable flex flex-1 flex-col items-center gap-2"
              >
                <RoundIcon52 name={a.icon} />
                <span className="whitespace-pre-line text-center text-caption">{t(a.label)}</span>
              </button>
            ))}
          </div>

          {/* Card is visual only (not in this demo). */}
          <div className="relative mx-auto mt-7 h-[186px] w-[295px] rounded-component border-[0.5px] border-white20 bg-black-card px-4 py-[10px]">
            <span className="absolute right-4 top-[14px] font-display text-[22px] font-black italic tracking-tight text-white">VISA</span>
          </div>
        </div>

        <div className="relative -mt-[134px] min-h-[480px] rounded-t-container bg-surface pb-32 pt-[10px]">
          <Feed />
        </div>
      </div>
    </div>
  )
}
