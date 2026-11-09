// Parsing of the Figma export specs (design/figma-export/specs/*.json).

/** "Display Semibold 23/30 ls0.35" → { family, weight, size, lineHeight, letterSpacing } */
export function parseStyle(style) {
  const m = style.match(/^(Display|Text|SF Pro|SF Compact)\s+(\w+)\s+([\d.]+)\/([\d.a]+)(?:\s+ls(-?[\d.]+))?/)
  if (!m) return null
  const weights = { Regular: 400, Medium: 500, Semibold: 600, Bold: 700 }
  return {
    family: m[1],
    weight: weights[m[2]] ?? 400,
    size: Number(m[3]),
    lineHeight: m[4] === 'a' ? null : Number(m[4]),
    letterSpacing: m[5] === undefined ? 0 : Number(m[5]),
  }
}

/** "#000000@0.5 {base/onBackgroundSecondary}" → { r, g, b, a } */
export function parseColor(color) {
  const m = color.match(/#([0-9a-fA-F]{6})(?:@([\d.]+))?/)
  if (!m) return null
  const n = parseInt(m[1], 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: m[2] === undefined ? 1 : Number(m[2]) }
}

/** "Primary button[0,706,402x168]:#ffffff" → { name, x, y, w, h } (layers with a box only). */
export function parseLayer(layer) {
  const m = layer.match(/^(.*?)\[(-?[\d.]+),(-?[\d.]+),([\d.]+)x([\d.]+)(?:\s+r([\d.]+))?\]:(.*)$/)
  if (!m) return null
  return { name: m[1], x: +m[2], y: +m[3], w: +m[4], h: +m[5], radius: m[6] ? +m[6] : null, fill: m[7] }
}

export const normalise = (s) => s.replace(/\s+/g, ' ').trim()
