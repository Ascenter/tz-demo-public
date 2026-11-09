interface Props {
  children: React.ReactNode
  tone?: 'dark' | 'gray' | 'green' | 'custom'
  color?: string
}

/** Small label pill next to a title — bank brand, operator, "Soon", "New recipient" (Figma "badge"). */
export function Badge({ children, tone = 'dark', color }: Props) {
  const styles: Record<string, React.CSSProperties> = {
    dark: { background: 'var(--color-badge-dark)', color: 'var(--color-surface)' },
    gray: { background: 'var(--color-field-bg)', color: 'var(--color-on-bg-secondary)' },
    green: { background: 'var(--color-turquoise)', color: 'var(--color-surface)' },
    custom: { background: color, color: 'var(--color-surface)' },
  }
  return (
    <span
      className="inline-flex h-4 items-center rounded-[5px] px-[5px] t-semibold-11 whitespace-nowrap"
      style={styles[tone]}
    >
      {children}
    </span>
  )
}
