import { Icon, type IconName } from './icons'

interface Props {
  icon?: IconName
  initials?: string
  color?: string
  iconColor?: string
  size?: number
}

/** 40 px round icon or initials avatar (Figma "icon / 40 / Category icon", "ic_avatar_text"). */
export function Avatar({ icon, initials, color = '#7a80ff', iconColor = '#fff', size = 40 }: Props) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full"
      style={{ width: size, height: size, background: color, border: initials ? '0.5px solid rgba(0,0,0,0.2)' : undefined }}
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
  const palette = ['#39cc7e', '#7a80ff', '#ff9d57', '#4bc5eb', '#c58bf2', '#f2668b', '#566dcc', '#88c758']
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return palette[h % palette.length]
}

export function initialsOf(name: string): string {
  const parts = name.replace(/[^\p{L}\s]/gu, '').trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}
