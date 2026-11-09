import { useLocation, useNavigate } from 'react-router'
import { Icon, type IconName } from '../components/icons'
import { t, type TextKey } from '../mock/texts'

const TABS: { path: string; icon: IconName; label: TextKey }[] = [
  { path: '/', icon: 'tabHome', label: 'tabs.home' },
  { path: '/payments', icon: 'tabPayments', label: 'tabs.payments' },
  { path: '/credit', icon: 'tabCredit', label: 'tabs.credit' },
  { path: '/savings', icon: 'tabSavings', label: 'tabs.savings' },
  { path: '/more', icon: 'tabMore', label: 'tabs.more' },
]

export const TAB_PATHS = TABS.map((x) => x.path)

/** Liquid-glass tab bar (Figma "tabbarLiquidGlass"): Home, Payments, Credit, Savings, More. */
export function TabBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  return (
    <nav
      className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-b from-white/0 from-[5%] to-white px-[25px] pt-1"
      style={{ paddingBottom: 'max(calc(var(--safe-bottom) - 10px), 8px)' }}
    >
      <div className="liquid-glass relative flex rounded-full p-1">
        {TABS.map((tab) => {
          const active = pathname === tab.path
          return (
            <button
              key={tab.path}
              type="button"
              data-testid={`tab-${tab.path === '/' ? 'home' : tab.path.slice(1)}`}
              aria-current={active ? 'page' : undefined}
              onClick={() => !active && navigate(tab.path, { replace: true, state: { tab: true } })}
              className={`flex h-[55px] flex-1 flex-col items-center justify-center gap-px rounded-full ${active ? 'bg-tab-selection' : ''}`}
            >
              <Icon name={tab.icon} size={28} color={active ? 'var(--color-tab-active)' : '#000'} />
              <span className={`t-medium-9 ${active ? 'text-tab-active' : 'text-on-bg-primary'}`}>{t(tab.label)}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
