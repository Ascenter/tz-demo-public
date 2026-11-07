interface Props {
  children: React.ReactNode
  tone?: 'dark' | 'gray' | 'green' | 'custom'
  color?: string
}

/** Small label pill next to a title — bank brand, operator, "Soon", "New recipient" (Figma "badge"). */
export function Badge({ children, tone = 'dark', color }: Props) {
  const styles: Record<string, React.CSSProperties> = {
    dark: { background: '#000', color: '#fff' },
    gray: { background: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.5)' },
    green: { background: '#39cc7e', color: '#fff' },
    custom: { background: color, color: '#fff' },
  }
  return (
    <span
      className="inline-flex h-4 items-center rounded-[5px] px-[5px] text-nano font-semibold whitespace-nowrap"
      style={styles[tone]}
    >
      {children}
    </span>
  )
}
