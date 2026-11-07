// parent BR-14: "TZS 250,000" — currency code first, comma thousands, no decimals.
const nf = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

/** 250000 → "250,000" (bare amount, used in feed rows and headers). */
export function formatNumber(n: number): string {
  return nf.format(Math.round(n))
}

/** 250000 → "TZS 250,000". Use everywhere text shows money with a currency. */
export function formatTZS(n: number): string {
  return `TZS ${formatNumber(n)}`
}

/** Feed rows: outgoing "20,000", incoming "+150,000" (as in Figma). */
export function formatFeedAmount(n: number, direction: 'in' | 'out'): string {
  return direction === 'in' ? `+${formatNumber(n)}` : formatNumber(n)
}

/** Keep digits only. */
export function digitsOnly(s: string): string {
  return s.replace(/\D/g, '')
}

/** "991081123890" with [4,4,4] → "9910 8112 3890". Extra digits go into the last group. */
export function groupDigits(s: string, sizes: number[]): string {
  const d = digitsOnly(s)
  const out: string[] = []
  let i = 0
  for (let g = 0; g < sizes.length && i < d.length; g++) {
    const size = g === sizes.length - 1 ? d.length - i : sizes[g]
    out.push(d.slice(i, i + size))
    i += size
  }
  return out.join(' ')
}

/** Tanzanian mobile in international form: "+255754318902" or "0754318902" → "+255 754 318 902". */
export function formatPhone(raw: string): string {
  const d = digitsOnly(raw)
  const local = d.startsWith('255') ? d.slice(3) : d.startsWith('0') ? d.slice(1) : d
  if (local.length !== 9) return raw
  return `+255 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`
}

const pad = (n: number) => String(n).padStart(2, '0')

/** "12:34" */
export function formatTime(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** "12:05, 31.10.2026" — receipt date format, as in Figma. */
export function formatDateTime(d: Date): string {
  return `${formatTime(d)}, ${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
}

/** Amount typed on the keypad → number (0 when empty). */
export function parseAmount(s: string): number {
  const d = digitsOnly(s)
  return d ? Number(d) : 0
}
