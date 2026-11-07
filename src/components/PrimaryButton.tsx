import type { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'nobg' | 'secondary'
}

/** 52 px pill button (Figma "Primary button component": Primary · No BG · Secondary). */
export function PrimaryButton({ variant = 'primary', className = '', children, ...rest }: Props) {
  const base = 'pressable flex h-[52px] w-full items-center justify-center rounded-full text-body-l font-semibold'
  const v =
    variant === 'primary'
      ? 'bg-button text-white disabled:bg-black/15 disabled:text-white'
      : variant === 'secondary'
        ? 'bg-tertiary-bg text-primary disabled:text-secondary'
        : 'bg-transparent text-secondary'
  return (
    <button type="button" className={`${base} ${v} ${className}`} {...rest}>
      {children}
    </button>
  )
}

/** Bottom button block at the screen edge (Figma "Primary button"), with home indicator space. */
export function ButtonBar({ children, gray }: { children: React.ReactNode; gray?: boolean }) {
  return (
    <div
      className="flex shrink-0 flex-col gap-[10px] px-5 pt-[10px]"
      style={{
        paddingBottom: 'calc(var(--safe-bottom) + 10px)',
        background: gray ? 'var(--color-light-gray)' : 'transparent',
      }}
    >
      {children}
    </div>
  )
}

/** Small grey pill action inside a receipt ("Save contact", "Copy token"). */
export function MiniButton({ children, onClick, testId }: { children: React.ReactNode; onClick?: () => void; testId?: string }) {
  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onClick}
      className="pressable inline-flex items-center rounded-full bg-tertiary-bg px-3 py-[5px] text-caption font-semibold text-primary"
    >
      {children}
    </button>
  )
}
