import { Icon, RoundIcon, hasRoundIcon, type IconName } from './icons'

interface Props {
  icon?: IconName
  initials?: string
  color?: string
  iconColor?: string
  size?: number
}

/** 40 px round icon or initials avatar (Figma "icon / 40 / Category icon", "ic_avatar_text"). */
export function Avatar({ icon, initials, color, iconColor = 'var(--color-surface)', size = 40 }: Props) {
  // Category and method icons: the Figma 40 pt round icon, circle recoloured only when the row sets a colour.
  if (icon && !initials && hasRoundIcon(icon)) return <RoundIcon name={icon} size={size} color={color} />
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full"
      style={{ width: size, height: size, background: color ?? 'var(--color-slate-blue)', border: initials ? '0.5px solid var(--color-border-unselected)' : undefined }}
    >
      {initials ? (
        <span className="t-regular-16 text-white">{initials}</span>
      ) : icon ? (
        <Icon name={icon} size={size * 0.6} color={iconColor} />
      ) : null}
    </span>
  )
}

/** Stable colour for a name, so initials avatars keep their colour between screens. */
export function colorFor(name: string): string {
  const palette = ['turquoise', 'slate-blue', 'light-orange', 'sky', 'medium-purple', 'sweet-tomato', 'indigo', 'lime'].map((c) => `var(--color-${c})`)
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return palette[h % palette.length]
}

export function initialsOf(name: string): string {
  const parts = name.replace(/[^\p{L}\s]/gu, '').trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}
