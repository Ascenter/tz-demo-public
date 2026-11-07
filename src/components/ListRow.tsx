import type { ReactNode } from 'react'
import { Avatar } from './Avatar'
import type { IconName } from './icons'

interface Props {
  title: ReactNode
  subtitle?: ReactNode
  icon?: IconName
  iconColor?: string
  initials?: string
  avatarColor?: string
  leading?: ReactNode
  right?: ReactNode
  /** Missing onClick = inert row: rendered as in Figma, a tap does nothing, no error. */
  onClick?: () => void
  testId?: string
  /** Shown at 40 % (e.g. "Soon" billers, Figma 234:772). */
  dimmed?: boolean
  /** Extra line under the subtitle (e.g. a "Soon" badge). */
  below?: ReactNode
}

/** List row: icon 40, title 16, subtitle 14 (Figma "List_item" / "Transaction_list_item"). */
export function ListRow({ title, subtitle, icon, iconColor, initials, avatarColor, leading, right, onClick, testId, dimmed, below }: Props) {
  const content = (
    <>
      {leading ?? <Avatar icon={icon} initials={initials} color={avatarColor} iconColor={iconColor} />}
      <span className="flex min-w-0 flex-1 flex-col items-start text-left">
        <span className="w-full truncate text-body-l text-primary">{title}</span>
        {subtitle !== undefined && <span className="w-full text-body-m text-secondary">{subtitle}</span>}
        {below && <span className="mt-1">{below}</span>}
      </span>
      {right}
    </>
  )
  const cls = `flex min-h-[60px] w-full items-center gap-5 px-5 py-[10px] ${dimmed ? 'opacity-40' : ''}`
  return onClick ? (
    <button type="button" data-testid={testId} onClick={onClick} className={`${cls} row-pressable`}>
      {content}
    </button>
  ) : (
    <div data-testid={testId} className={cls} aria-disabled="true">
      {content}
    </div>
  )
}

/** Caps group header, 36 px (Figma "caps subtitle"). */
export function CapsHeader({ children, right, testId }: { children: ReactNode; right?: ReactNode; testId?: string }) {
  return (
    <div className="flex h-9 items-center justify-between px-5 py-[6px]">
      <span data-testid={testId} className="text-sticky font-semibold text-sticky-header uppercase">
        {children}
      </span>
      {right}
    </div>
  )
}
