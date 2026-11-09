import type { ReactNode } from 'react'

interface Props {
  /** CSS gradient for the header area (tokens --gradient-*). Omit for a plain white screen. */
  gradient?: string
  /** NavBar and header content above the white sheet. */
  header?: ReactNode
  children: ReactNode
  /** Fixed bottom area (buttons, keypad). */
  footer?: ReactNode
  /** Sheet scrolls by default; amount screens lay out without scrolling. */
  scroll?: boolean
  testId?: string
  /** 12 pt above the sheet content (lists). Amount screens lay out from the sheet edge. */
  sheetPadding?: boolean
  /**
   * Gradient box: 260 pt on list screens (stops at 0–25 % → solid from 65 pt), the whole screen on amount and
   * method screens (solid from 218 pt), as in the Figma layers.
   */
  gradientFull?: boolean
}

/**
 * Screen frame used by every flow: gradient header, white rounded sheet (radius 32) holding the content,
 * optional fixed footer. Absolutely fills the phone viewport.
 */
export function Screen({ gradient, header, children, footer, scroll = true, testId, sheetPadding = true, gradientFull }: Props) {
  return (
    <div data-testid={testId} className="absolute inset-0 flex flex-col overflow-hidden bg-surface">
      {gradient && <div className={`absolute inset-x-0 top-0 ${gradientFull ? 'h-full' : 'h-[260px]'}`} style={{ background: gradient }} />}
      <div className="relative shrink-0">{header}</div>
      <div
        className={`relative flex min-h-0 flex-1 flex-col bg-surface ${gradient ? 'rounded-t-container' : ''}`}
      >
        <div className={`flex min-h-0 flex-1 flex-col ${scroll ? 'scroll-y' : ''} ${gradient && sheetPadding ? 'pt-3' : ''}`}>{children}</div>
        {footer}
      </div>
    </div>
  )
}
