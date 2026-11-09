// Runs inside the page (page.evaluate). Finds every target text and measures where and how it is drawn.
// Input: [{ text }] with whitespace-normalised strings. Output per text: all visible candidates with
// glyph box (left/right from a Range, top = line-box top of the first line) and computed type and colour.
export function measureTexts(targets) {
  const norm = (s) => s.replace(/\s+/g, ' ').trim()
  const screen = document.getElementById('phone-screen')
  const frame = screen.getBoundingClientRect()

  const isVisible = (el) => {
    for (let e = el; e && e !== document.body; e = e.parentElement) {
      const cs = getComputedStyle(e)
      if (cs.display === 'none' || cs.visibility === 'hidden') return false
    }
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.height > 0 && r.bottom > frame.top && r.top < frame.bottom && r.right > frame.left && r.left < frame.right
  }
  const opacityOf = (el) => {
    let o = 1
    for (let e = el; e && e !== document.body; e = e.parentElement) o *= Number(getComputedStyle(e).opacity)
    return o
  }
  const parseRgb = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/)
    if (!m) return null
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number)
    return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 }
  }

  // Text containers: elements whose own text (all descendants) equals the target, deepest first.
  const all = [...screen.querySelectorAll('*')]
  // Raw text (textContent) so CSS text-transform does not matter; innerText as a fallback for <br> line breaks.
  const textOf = (el) => (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement ? null : norm(el.textContent ?? ''))
  const textOf2 = (el) => (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement ? null : norm(el.innerText ?? ''))

  return targets.map(({ text }) => {
    const want = norm(text)
    const cands = []
    for (const el of all) {
      let kind = null
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        if (norm(el.value) === want) kind = 'value'
        else if (!el.value && norm(el.placeholder) === want) kind = 'placeholder'
      } else if (textOf(el) === want || textOf2(el) === want) {
        // keep the deepest element only: skip if a child has the same text
        if ([...el.children].some((c) => textOf(c) === want || textOf2(c) === want)) continue
        kind = 'text'
      }
      if (!kind || !isVisible(el)) continue
      const cs = getComputedStyle(el, kind === 'placeholder' ? '::placeholder' : null)
      const box = el.getBoundingClientRect()
      let left, right, top
      if (kind === 'text') {
        const range = document.createRange()
        range.selectNodeContents(el)
        const rects = [...range.getClientRects()].filter((r) => r.width > 0)
        if (!rects.length) continue
        left = Math.min(...rects.map((r) => r.left))
        right = Math.max(...rects.map((r) => r.right))
        // Line-box top of the first line: the glyph box is centred in the line box.
        const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2
        const first = rects.reduce((a, r) => (r.top < a.top ? r : a))
        top = first.top + first.height / 2 - lh / 2
      } else {
        const pl = parseFloat(getComputedStyle(el).paddingLeft)
        const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2
        left = box.left + pl
        right = box.right - parseFloat(getComputedStyle(el).paddingRight)
        top = box.top + box.height / 2 - lh / 2
        // Approximate glyph width for the value with a canvas measure in the same font.
        const ctx = document.createElement('canvas').getContext('2d')
        ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
        const w = ctx.measureText(want).width + (parseFloat(cs.letterSpacing) || 0) * want.length
        const align = getComputedStyle(el).textAlign
        if (align === 'center') {
          const c = (box.left + box.right) / 2
          left = c - w / 2
          right = c + w / 2
        } else right = left + w
      }
      const color = parseRgb(cs.color)
      if (color) color.a *= opacityOf(el)
      cands.push({
        kind,
        x: left - frame.left,
        right: right - frame.left,
        y: top - frame.top,
        fontSize: parseFloat(cs.fontSize),
        lineHeight: parseFloat(cs.lineHeight) || null,
        fontWeight: Number(cs.fontWeight),
        letterSpacing: cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing),
        fontFamily: cs.fontFamily,
        textTransform: cs.textTransform,
        color,
      })
    }
    return { text, cands }
  })
}

/** Layout sanity on the iPhone 15 Plus pass: horizontal overflow and content cut off at the edges. */
export function layoutProblems() {
  const screen = document.getElementById('phone-screen')
  const f = screen.getBoundingClientRect()
  const out = []
  for (const el of screen.querySelectorAll('button, input, p, h1, h2, span, img, picture')) {
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height) continue
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue
    // Ignore elements parked off-screen by a transition or a scroll container.
    if (r.right <= f.left || r.left >= f.right || r.bottom <= f.top || r.top >= f.bottom) continue
    if (r.left < f.left - 0.5 || r.right > f.right + 0.5) {
      const label = (el.getAttribute('data-testid') ?? el.textContent ?? el.tagName).trim().slice(0, 40)
      out.push(`${el.tagName.toLowerCase()} "${label}" sticks out horizontally (${Math.round(r.left - f.left)}…${Math.round(r.right - f.left)})`)
    }
    if ((el.tagName === 'P' || el.tagName === 'SPAN') && el.scrollWidth > el.clientWidth + 1 && cs.overflow === 'hidden' && cs.textOverflow !== 'ellipsis') {
      out.push(`text "${el.textContent.trim().slice(0, 40)}" is clipped`)
    }
  }
  return [...new Set(out)].slice(0, 20)
}
