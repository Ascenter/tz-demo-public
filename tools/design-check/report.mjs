// qa/design/report.html: one row per screen (Figma | app | diff | iPhone 15 Plus), worst first.
import { writeFileSync } from 'node:fs'

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

export function writeReport(out, results, { gate, visualTarget, mac }) {
  const rows = [...results].sort((a, b) => (b.visual?.mismatch ?? 1) - (a.visual?.mismatch ?? 1))
  const pct = (x) => (x === undefined || x === null ? '—' : `${(x * 100).toFixed(1)}%`)
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Design check</title>
<style>
:root{--bg:#f4f4f6;--card:#fff;--fg:#111;--muted:#666;--ok:#1a8f4c;--bad:#d63b2f;--warn:#b07800}
@media (prefers-color-scheme:dark){:root{--bg:#111;--card:#1c1c1e;--fg:#eee;--muted:#999}}
body{font:14px/1.4 -apple-system,system-ui,sans-serif;background:var(--bg);color:var(--fg);margin:0;padding:16px}
h1{font-size:20px;margin:0 0 4px}.sum{color:var(--muted);margin:0 0 16px}
.row{background:var(--card);border-radius:12px;padding:12px;margin:0 0 16px}
.head{display:flex;flex-wrap:wrap;gap:12px;align-items:baseline;margin-bottom:8px}.head b{font-size:15px}
.ok{color:var(--ok)}.bad{color:var(--bad)}.warn{color:var(--warn)}.muted{color:var(--muted)}
.imgs{display:flex;gap:8px;overflow-x:auto}.imgs figure{margin:0;flex:0 0 auto}.imgs img{width:201px;border-radius:8px;border:1px solid #8883;display:block}
.imgs .w430 img{width:215px}figcaption{font-size:12px;color:var(--muted)}
details{margin-top:8px}table{border-collapse:collapse;font-size:12px;width:100%}td,th{text-align:left;padding:2px 6px;border-bottom:1px solid #8882;vertical-align:top}
</style>
<h1>Design check: app vs Figma</h1>
<p class="sum">${results.length} screens · gate: spec conformance ≥ ${gate * 100}% (A) · visual diff (B) is a guide${
    visualTarget !== null ? `, target ≤ ${visualTarget * 100}% (macOS)` : ' (fonts differ off macOS)'
  } · sorted by visual mismatch, worst first${mac ? ' · macOS run' : ''}</p>
${rows
  .map((r) => {
    const conf = r.error ? `<span class="bad">error: ${esc(r.error)}</span>` : `<span class="${r.conformance >= gate ? 'ok' : 'bad'}">conformance ${pct(r.conformance)} (${r.passed}/${r.checked})</span>`
    const vis = r.visual ? `<span class="${visualTarget !== null && r.visual.mismatch > visualTarget ? 'bad' : 'muted'}">visual ${pct(r.visual.mismatch)}</span>` : ''
    const fails = (r.texts ?? []).filter((t) => t.status === 'fail')
    const expected = (r.texts ?? []).filter((t) => t.status === 'expected' || t.deviation)
    const lay = (r.layout430 ?? []).length ? `<span class="warn">430 pt: ${r.layout430.length} layout issue(s)</span>` : ''
    return `<div class="row"><div class="head"><b>${esc(r.name)}</b><span class="muted">${esc(r.figmaId)} · ${esc(r.flow)}</span>${conf}${vis}${lay}</div>
<div class="imgs">${['figma', 'app', 'diff']
      .map((k) => `<figure><img loading="lazy" src="${esc(r.dir)}${k}.png" alt="${k}"><figcaption>${k === 'app' ? 'app (402 × 874)' : k}</figcaption></figure>`)
      .join('')}<figure class="w430"><img loading="lazy" src="${esc(r.dir)}app-430.png" alt="iPhone 15 Plus"><figcaption>iPhone 15 Plus (430 × 932)</figcaption></figure></div>
${fails.length ? `<details open><summary class="bad">${fails.length} mismatch(es)</summary><table><tr><th>text</th><th>expected (Figma)</th><th>actual</th><th>problem</th></tr>${fails.map((t) => `<tr><td>${esc(t.text)}${t.deviation ? ` → ${esc(t.appText)}` : ''}</td><td>${esc(t.expected)}</td><td>${esc(t.actual)}</td><td>${esc((t.problems ?? []).join('; '))}</td></tr>`).join('')}</table></details>` : ''}
${expected.length ? `<details><summary class="muted">${expected.length} expected deviation(s) (BRD / ASSUMPTIONS.md)</summary><table>${expected.map((t) => `<tr><td>${esc(t.text)}</td><td>${t.status === 'expected' ? 'not shown' : `→ ${esc(t.appText)}`}</td><td>${esc(t.status)}</td></tr>`).join('')}</table></details>` : ''}
${(r.layout430 ?? []).length ? `<details><summary class="warn">iPhone 15 Plus layout</summary><ul>${r.layout430.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></details>` : ''}
</div>`
  })
  .join('\n')}`
  writeFileSync(`${out}report.html`, html)
}
