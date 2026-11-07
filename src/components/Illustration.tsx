// Placeholder visuals for result screens. The Figma mascot illustrations (lion) could not be
// downloaded in this build environment; replace these with the exported Figma assets.
type Kind = 'success' | 'error' | 'phone' | 'pending' | 'cash'

const STYLE: Record<Kind, { bg: string; glyph: string }> = {
  success: { bg: 'linear-gradient(135deg,#d8f7e3,#a7f5ac)', glyph: '✓' },
  error: { bg: 'linear-gradient(135deg,#ffe3dc,#ffc3ad)', glyph: '!' },
  phone: { bg: 'linear-gradient(135deg,#e5ecff,#b8b8ff)', glyph: '📱' },
  pending: { bg: 'linear-gradient(135deg,#fff5d6,#ffe08a)', glyph: '⏳' },
  cash: { bg: 'linear-gradient(135deg,#e7f8d8,#b9e88f)', glyph: '💵' },
}

export function Illustration({ kind, size = 160 }: { kind: Kind; size?: number }) {
  const s = STYLE[kind]
  const isText = s.glyph.length === 1 && /[✓!]/.test(s.glyph)
  return (
    <div
      aria-hidden="true"
      className="grid place-items-center rounded-full"
      style={{ width: size, height: size, background: s.bg }}
    >
      <span
        style={{
          fontSize: isText ? size * 0.42 : size * 0.4,
          fontWeight: 700,
          color: kind === 'success' ? '#1a8f4c' : kind === 'error' ? '#e0563b' : undefined,
        }}
      >
        {s.glyph}
      </span>
    </div>
  )
}
