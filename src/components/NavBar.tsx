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
    <div className="flex flex-col gap-1 px-5 pb-6 pt-2">
      <h1 className="t-display-26">{title}</h1>
      {subtitle && <p className="t-regular-14 text-on-bg-secondary">{subtitle}</p>}
    </div>
  )
}

/**
 * Header item with a rounded icon: avatar + name + badge or subtitle (Figma "Header item with rounded icon").
 * 68 pt tall under the 88 pt nav bar, so the white sheet starts at y = 156 as in the Figma amount screens.
 * The title sits at x = 94 (icon column 54 pt, icon at its right edge); `compact` puts it at x = 80 (Cash, 176:2000).
 */
export function HeaderItem({
  leading,
  title,
  badge,
  subtitle,
  compact,
}: {
  leading: ReactNode
  title: ReactNode
  badge?: ReactNode
  subtitle?: ReactNode
  compact?: boolean
}) {
  return (
    <div className="flex h-[68px] items-start gap-5 px-5 pt-[2px]">
      <span className={`flex shrink-0 justify-end pt-[2px] ${compact ? '' : 'w-[54px]'}`}>{leading}</span>
      <div className="flex min-w-0 flex-col items-start">
        <span data-testid="header-title" className="truncate t-semibold-16">{title}</span>
        {badge && <span className="mt-[3px]">{badge}</span>}
        {subtitle && <span className="t-regular-14 text-on-bg-secondary">{subtitle}</span>}
      </div>
    </div>
  )
}
