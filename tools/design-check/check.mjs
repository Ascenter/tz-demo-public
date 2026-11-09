#!/usr/bin/env node
// design:check — compares the app with the offline Figma export (design/figma-export/).
//   A. Spec conformance (the gate): every text in a screen's spec must be drawn at the same place
//      (±3 pt) with the same size, line height, weight, tracking (±0.1) and colour (with alpha).
//   B. Visual diff (a guide): app screenshot vs the Figma PNG with pixelmatch, masks applied.
// Plus an iPhone 15 Plus pass (430 × 932 @3x) that flags horizontal overflow and clipped text.
// Usage: npm run design:check [-- --flow 04-cash-withdrawal] [--screen 176:2903] [--no-visual] [--no-430]
// Output: qa/design/report.html, qa/design/results.json, qa/design/<flow>/<screen>/{figma,app,diff,app-430}.png
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'
import { webkit, chromium } from 'playwright'
import { parseStyle, parseColor, normalise } from './spec.mjs'
import { measureTexts, layoutProblems } from './measure.mjs'
import { writeReport } from './report.mjs'

const ROOT = new URL('../../', import.meta.url).pathname
const EXPORT = `${ROOT}design/figma-export/`
const OUT = `${ROOT}qa/design/`
const args = process.argv.slice(2)
const opt = (name) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}
const flag = (name) => args.includes(`--${name}`)

const TOL_POS = 3
const TOL_LS = 0.1
const GATE = 0.95
const MAC = flag('mac')
const VISUAL_TARGET = MAC ? 0.03 : null // ≤ 3 % per screen on macOS (SF Pro present)
const BROWSER = opt('browser') ?? 'webkit'
const PORT = Number(opt('port') ?? 4174)

if (!existsSync(EXPORT)) {
  console.error('design/figma-export/ is missing. Unzip tz-figma-export.zip into design/ (see README, "Design sync").')
  process.exit(2)
}

const map = JSON.parse(readFileSync(`${ROOT}design/screen-map.json`, 'utf8'))
const globalDev = JSON.parse(readFileSync(new URL('./deviations.json', import.meta.url), 'utf8'))
let screens = map.screens
if (opt('flow')) screens = screens.filter((s) => s.flow === opt('flow') || s.flow.startsWith(opt('flow')))
if (opt('screen')) screens = screens.filter((s) => opt('screen').split(',').includes(s.figmaId))
if (!screens.length) {
  console.error('No screens match.')
  process.exit(2)
}

// ── server ────────────────────────────────────────────────────────────────
let server = null
let BASE = process.env.DESIGN_URL
if (!BASE) {
  BASE = `http://localhost:${PORT}`
  if (!flag('no-build')) await run('npx', ['vite', 'build', '--logLevel', 'warn'])
  server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { cwd: ROOT, stdio: 'ignore' })
  await waitForServer(BASE)
}

const browserType = BROWSER === 'chromium' ? chromium : webkit
const browser = await browserType.launch()
if (!opt('screen') && !opt('flow')) rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

const results = []
for (const s of screens) {
  const dir = `${OUT}${s.flow}/${s.figmaId.replace(':', '-')}/`
  mkdirSync(dir, { recursive: true })
  const r = { ...s, dir: dir.replace(OUT, ''), error: null }
  try {
    // A + B at the Figma frame size, 1 px = 1 pt.
    const page = await openScreen(s, { device: 'figma', width: 402, height: 874, dpr: 1 })
    Object.assign(r, await conformance(page, s))
    await page.screenshot({ path: `${dir}app.png` })
    await page.context().close()
    if (!flag('no-visual')) r.visual = visualDiff(s, dir)
    // iPhone 15 Plus pass: screenshot at @3x and layout sanity.
    if (!flag('no-430')) {
      const p2 = await openScreen(s, { device: 'iphone15plus', width: 430, height: 932, dpr: 3 })
      r.layout430 = await p2.evaluate(layoutProblems)
      await p2.screenshot({ path: `${dir}app-430.png` })
      await p2.context().close()
    }
  } catch (e) {
    r.error = String(e.message ?? e).split('\n')[0]
  }
  results.push(r)
  const c = r.conformance
  console.log(
    `${r.error ? '✗' : c >= GATE ? '✓' : '·'} ${s.figmaId.padEnd(10)} ${s.name.padEnd(58)} ${
      r.error ? r.error : `${(c * 100).toFixed(1).padStart(5)}%  (${r.passed}/${r.checked})` + (r.visual ? `  visual ${(r.visual.mismatch * 100).toFixed(1)}%` : '')
    }`,
  )
}

await browser.close()
server?.kill()

// Merge with earlier runs of other flows so the report always covers every screen checked so far.
const resultsPath = `${OUT}results.json`
const previous = existsSync(resultsPath) ? JSON.parse(readFileSync(resultsPath, 'utf8')).results : []
const merged = [...previous.filter((p) => !results.some((r) => r.figmaId === p.figmaId)), ...results]
writeFileSync(resultsPath, JSON.stringify({ generated: new Date().toISOString(), browser: BROWSER, mac: MAC, results: merged }, null, 1))
writeReport(OUT, merged, { gate: GATE, visualTarget: VISUAL_TARGET, mac: MAC })

const failing = results.filter((r) => r.error || r.conformance < GATE || (VISUAL_TARGET !== null && r.visual && r.visual.mismatch > VISUAL_TARGET))
console.log(`\n${results.length - failing.length}/${results.length} screens pass. Report: qa/design/report.html`)
process.exit(failing.length ? 1 : 0)

// ── helpers ───────────────────────────────────────────────────────────────
async function openScreen(s, { device, width, height, dpr }) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dpr })
  await ctx.addInitScript(() => {
    // Fastest loader (still ≥ 200 ms, parent BR-03); the store reads this on load.
    if (!sessionStorage.getItem('dc-init')) {
      sessionStorage.setItem('dc-init', '1')
      localStorage.setItem('mo-simba-demo', JSON.stringify({ state: { showFrame: false, loaderMs: 200 }, version: 1 }))
    }
  })
  const page = await ctx.newPage()
  page.setDefaultTimeout(15000)
  await page.goto(`${BASE}/?e2e=1&bare=1&device=${device}`)
  await page.waitForFunction(() => window.__demo && document.querySelector('[data-testid="home"]'))
  await page.evaluate((n) => window.__demo.jumpToStep(n), s.setup.step)
  await page.waitForTimeout(150)
  await page.evaluate((a) => window.__demo.run(a), s.setup.actions)
  await page.waitForTimeout(s.setup.settleMs ?? 450)
  // Caret blink and spinners: freeze them so screenshots are stable.
  await page.addStyleTag({ content: '.caret{animation:none!important;opacity:1!important} *{caret-color:transparent!important}' })
  return page
}

async function conformance(page, s) {
  const spec = JSON.parse(readFileSync(`${ROOT}${s.spec}`, 'utf8'))
  const ignoreBelow = s.keyboard ? 556 : Infinity // the drawn iOS keyboard is not rendered by the app
  const dev = { ...globalDev.texts, ...(s.deviations ?? {}) }
  const items = []
  for (const t of spec.texts) {
    // Status bar time, the drawn keyboard and texts below the frame (scrolled out) are not compared.
    if (t.text === '9:41' || t.y >= ignoreBelow || t.y >= 874 - 4 || (s.ignore ?? []).includes(t.text)) continue
    const figmaText = normalise(t.text)
    const appText = Object.hasOwn(dev, figmaText) ? dev[figmaText] : figmaText
    if (appText === null) {
      items.push({ text: figmaText, status: 'expected', note: 'not shown in the app (BRD / ASSUMPTIONS.md)' })
      continue
    }
    items.push({ text: figmaText, appText, spec: t, status: 'pending', deviation: appText !== figmaText })
  }
  const measured = await page.evaluate(measureTexts, items.filter((i) => i.status === 'pending').map((i) => ({ text: i.appText })))
  let k = 0
  for (const it of items) {
    if (it.status !== 'pending') continue
    const { cands } = measured[k++]
    if (!cands.length) {
      it.status = 'fail'
      it.problems = ['not found in the app']
      continue
    }
    // Several hits (e.g. the same amount twice): take the one closest to the Figma position.
    const scored = cands.map((c) => ({ c, d: Math.abs(c.y - it.spec.y) + Math.min(...anchorDiffs(c, it.spec).map(Math.abs)) }))
    const best = scored.sort((a, b) => a.d - b.d)[0].c
    it.problems = compare(best, it.spec)
    it.actual = summarise(best)
    it.status = it.problems.length ? 'fail' : 'pass'
    // Known Figma inconsistencies (logged in ASSUMPTIONS.md) are listed, not counted.
    const known = s.known?.[it.text] ?? s.known?.[it.appText]
    if (it.status === 'fail' && known) {
      it.status = 'expected'
      it.note = `${known}: ${it.problems.join('; ')}`
    }
  }
  const checked = items.filter((i) => i.status === 'pass' || i.status === 'fail')
  const passed = checked.filter((i) => i.status === 'pass').length
  return {
    conformance: checked.length ? passed / checked.length : 1,
    checked: checked.length,
    passed,
    texts: items.map(({ spec, ...rest }) => ({ ...rest, expected: spec ? `${spec.style} ${spec.color.split(' ')[0]} @${spec.x},${spec.y} w${spec.w}` : undefined })),
  }
}

/** left / centre / right differences: font metrics differ off Apple platforms, so the closest anchor counts. */
function anchorDiffs(c, t) {
  return [c.x - t.x, (c.x + c.right) / 2 - (t.x + t.w / 2), c.right - (t.x + t.w)]
}

function compare(c, t) {
  const p = []
  const st = parseStyle(t.style)
  const col = parseColor(t.color)
  const dx = anchorDiffs(c, t)
  const ax = dx.reduce((a, b) => (Math.abs(b) < Math.abs(a) ? b : a))
  if (Math.abs(ax) > TOL_POS) p.push(`x off by ${ax.toFixed(1)} (app ${c.x.toFixed(0)}…${c.right.toFixed(0)}, Figma ${t.x}…${t.x + t.w})`)
  if (Math.abs(c.y - t.y) > TOL_POS) p.push(`y ${c.y.toFixed(1)} vs ${t.y}`)
  if (st) {
    if (Math.abs(c.fontSize - st.size) > 0.01) p.push(`font-size ${c.fontSize} vs ${st.size}`)
    if (st.lineHeight && c.lineHeight && Math.abs(c.lineHeight - st.lineHeight) > 0.01) p.push(`line-height ${c.lineHeight} vs ${st.lineHeight}`)
    if (c.fontWeight !== st.weight) p.push(`weight ${c.fontWeight} vs ${st.weight}`)
    if (Math.abs(c.letterSpacing - st.letterSpacing) > TOL_LS + 1e-6) p.push(`letter-spacing ${c.letterSpacing} vs ${st.letterSpacing}`)
    const display = /SF Pro Display/.test(c.fontFamily)
    if (st.family === 'Display' && !display) p.push('family Text vs Display')
    if (st.family === 'Text' && display) p.push('family Display vs Text')
  }
  if (col && c.color) {
    const dc = Math.max(Math.abs(c.color.r - col.r), Math.abs(c.color.g - col.g), Math.abs(c.color.b - col.b))
    if (dc > 2 || Math.abs(c.color.a - col.a) > 0.02) p.push(`color rgba(${c.color.r},${c.color.g},${c.color.b},${c.color.a.toFixed(2)}) vs ${t.color.split(' ')[0]}`)
  }
  return p
}

function summarise(c) {
  return `${c.fontSize}/${c.lineHeight} w${c.fontWeight} ls${c.letterSpacing} @${c.x.toFixed(0)},${c.y.toFixed(0)}`
}

function visualDiff(s, dir) {
  const figma = PNG.sync.read(readFileSync(`${ROOT}${s.png}`))
  const app = PNG.sync.read(readFileSync(`${dir}app.png`))
  const { width, height } = figma
  const masks = [[0, 0, 402, 44], ...(s.keyboard ? [[0, 556, 402, 318]] : []), ...(s.mask ?? [])]
  let masked = 0
  for (const img of [figma, app]) {
    for (const [x, y, w, h] of masks) {
      for (let yy = Math.max(0, y); yy < Math.min(height, y + h); yy++)
        for (let xx = Math.max(0, x); xx < Math.min(width, x + w); xx++) {
          const i = (yy * width + xx) * 4
          img.data[i] = 255
          img.data[i + 1] = 0
          img.data[i + 2] = 255
          img.data[i + 3] = 255
        }
    }
  }
  const inMask = (xx, yy) => masks.some(([x, y, w, h]) => xx >= x && xx < x + w && yy >= y && yy < y + h)
  for (let yy = 0; yy < height; yy++) for (let xx = 0; xx < width; xx++) if (inMask(xx, yy)) masked++
  const diff = new PNG({ width, height })
  const n = pixelmatch(figma.data, app.data, diff.data, width, height, { threshold: 0.1 })
  writeFileSync(`${dir}figma.png`, readFileSync(`${ROOT}${s.png}`))
  writeFileSync(`${dir}diff.png`, PNG.sync.write(diff))
  return { mismatch: n / (width * height - masked), pixels: n }
}

function run(cmd, a) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, a, { cwd: ROOT, stdio: 'inherit' })
    p.on('exit', (code) => (code === 0 ? res() : rej(new Error(`${cmd} ${a.join(' ')} failed`))))
  })
}

async function waitForServer(url) {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(url)).ok) return
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 200))
  }
  throw new Error(`preview server did not start on ${url}`)
}
