import type { ReactNode } from 'react'
import { Icon } from './icons'
import { t } from '../mock/texts'

interface Props {
  onBack?: () => void
  /** Centered toolbar title (Figma navBar "centred title"). */
  title?: ReactNode
  right?: ReactNode
  /** Close icon instead of the back arrow (result screens). */
  close?: boolean
}

/** Status-bar spacer + 44 px toolbar row. */
export function NavBar({ onBack, title, right, close }: Props) {
  return (
    <div className="relative z-10 shrink-0" style={{ paddingTop: 'var(--safe-top)' }}>
      <div className="relative flex h-11 items-center px-5">
        {onBack && (
          <button
            type="button"
            aria-label={t('payments.common.back')}
            data-testid="nav-back"
            onClick={onBack}
            className="pressable -ml-2 grid size-10 place-items-center"
          >
            <Icon name={close ? 'close' : 'arrowLeft'} />
          </button>
        )}
        {title && (
          <span className="pointer-events-none absolute inset-x-16 truncate text-center t-semibold-16">{title}</span>
        )}
        <span className="ml-auto flex items-center gap-5">{right}</span>
      </div>
    </div>
  )
}

/** Big left title under the toolbar (Figma navBar "left title"), with optional subtitle. */
export function LargeTitle({ title, subtitle }: { title: ReactNode; subtitle?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 px-5 pb-6">
      <h1 className="t-display-26">{title}</h1>
      {subtitle && <p className="t-regular-14 text-on-bg-secondary">{subtitle}</p>}
    </div>
  )
}

/** Header item with a rounded icon: avatar + name + badge (Figma "Header item with rounded icon"). */
export function HeaderItem({ leading, title, badge, subtitle }: { leading: ReactNode; title: ReactNode; badge?: ReactNode; subtitle?: ReactNode }) {
  return (
    <div className="flex items-center gap-5 px-5 pb-6 pt-1">
      {leading}
      <div className="flex min-w-0 flex-col items-start gap-1">
        <span data-testid="header-title" className="truncate t-semibold-16">{title}</span>
        {badge}
        {subtitle && <span className="t-regular-14 text-on-bg-secondary">{subtitle}</span>}
      </div>
    </div>
  )
}
