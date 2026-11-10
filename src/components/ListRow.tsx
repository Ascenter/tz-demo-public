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
  /** Icon at 40 % (e.g. "Soon" billers, Figma 234:772); the texts keep their colours. */
  dimmed?: boolean
  /** Extra line under the subtitle (e.g. a "Soon" badge). */
  below?: ReactNode
  /** Gap between the icon, the text and the right content (20 pt in every list). */
  gap?: number
  /** Let the title wrap instead of truncating (Home feed). */
  wrapTitle?: boolean
}

/** List row: icon 40, title 16, subtitle 14 (Figma "List_item" / "Transaction_list_item"). */
export function ListRow({ title, subtitle, icon, iconColor, initials, avatarColor, leading, right, onClick, testId, dimmed, below, gap = 20, wrapTitle }: Props) {
  const content = (
    <>
      <span className={`shrink-0 ${dimmed ? 'opacity-40' : ''}`}>
        {leading ?? <Avatar icon={icon} initials={initials} color={avatarColor} iconColor={iconColor} />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col items-start text-left">
        <span className={`w-full t-regular-16 text-on-bg-primary ${wrapTitle ? '' : 'truncate'}`}>{title}</span>
        {subtitle !== undefined && <span className="w-full t-regular-14 text-on-bg-secondary">{subtitle}</span>}
        {below && <span className="mt-1 flex">{below}</span>}
      </span>
      {right}
    </>
  )
  const cls = 'flex min-h-[60px] w-full items-center px-5 py-[10px]'
  return onClick ? (
    <button type="button" data-testid={testId} onClick={onClick} className={`${cls} row-pressable`} style={{ columnGap: gap }}>
      {content}
    </button>
  ) : (
    <div data-testid={testId} className={cls} style={{ columnGap: gap }} aria-disabled="true">
      {content}
    </div>
  )
}

/** Caps group header, 36 px (Figma "caps subtitle"). */
export function CapsHeader({ children, right, testId }: { children: ReactNode; right?: ReactNode; testId?: string }) {
  return (
    <div className="flex h-9 items-center justify-between px-5 py-[6px]">
      <span data-testid={testId} className="t-semibold-12 text-sticky-header uppercase">
        {children}
      </span>
      {right}
    </div>
  )
}
