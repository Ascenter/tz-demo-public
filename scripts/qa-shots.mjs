// Visual QA: screenshots our screens at 402 × 874 in the same state as the Figma reference frames
// (qa/figma/*.png) and writes qa/ours/*.png plus qa/index.html with the pairs side by side.
// Usage: npm run build && npx vite preview --port 4173 &  then  node scripts/qa-shots.mjs
import { chromium } from 'playwright'
import { writeFileSync, readdirSync } from 'node:fs'

const BASE = process.env.QA_URL ?? 'http://localhost:4173'
const OUT = new URL('../qa/', import.meta.url).pathname

const FIGMA_NODES = {
  '01-home': '1:3556', '02-payments': '1:4211', '03-scan-amount': '130:1441', '04-scan-sheet': '130:1558',
  '05-scan-receipt': '130:2154', '06-send-tips-receipt': '42:5875', '07-cash-code': '176:2903',
  '08-airtime-recipients': '222:919', '09-airtime-amount': '222:1102', '10-gov-institutions': '239:4123',
  '11-gov-bill': '239:5938', '12-bills-billers': '234:772', '13-bills-receipt': '234:1227',
}

const browser = await chromium.launch()

async function session() {
  const ctx = await browser.newContext({ viewport: { width: 470, height: 940 }, deviceScaleFactor: 1 })
  // Device frame hidden, fastest loader: the phone screen is exactly 402 × 874 like the Figma frames.
  await ctx.addInitScript(() => {
    if (!sessionStorage.getItem('qa-init')) {
      sessionStorage.setItem('qa-init', '1')
      localStorage.setItem('mo-simba-demo', JSON.stringify({ state: { showFrame: false, loaderMs: 200 }, version: 1 }))
    }
  })
  const page = await ctx.newPage()
  await page.goto(BASE)
  await page.getByTestId('home').waitFor()
  const id = (s) => page.getByTestId(s)
  const settle = (ms = 650) => page.waitForTimeout(ms)
  const api = {
    page, id, settle,
    async shot(name) {
      await settle()
      if (await id('push-banner').isVisible()) { await id('push-banner').click(); await settle(500) }
      await page.locator('#phone-screen').screenshot({ path: `${OUT}ours/${name}.png` })
      console.log('✓', name)
    },
    async jump(n) {
      const bar = id('status-bar'); await bar.click(); await bar.click(); await bar.click()
      await id(`demo-jump-${n}`).click(); await settle(2900) // let the confirmation toast fade
    },
    async type(n) { await settle(); for (const d of String(n)) await id(`key-${d}`).click() },
    async otp() { await settle(); for (const d of '123456') await id(`key-${d}`).click(); await settle(1200) },
    async payments() { await id('tab-payments').click(); await settle() },
    close: () => ctx.close(),
  }
  return api
}

let s = await session()
await s.shot('01-home')
await s.payments(); await s.shot('02-payments')
await s.close()

// Scan to pay at step 2 (Balance TZS 975,000)
s = await session(); await s.jump(2)
await s.id('quick-scan').click(); await s.settle(900)
await s.id('simulate-scan').click(); await s.settle(1200)
await s.type(25000); await s.id('comment').fill('For lunch'); await s.page.locator('input').blur()
await s.shot('03-scan-amount')
await s.id('amount-primary').click(); await s.shot('04-scan-sheet')
await s.id('sheet-confirm').click(); await s.otp(); await s.shot('05-scan-receipt')
await s.close()

// TIPS receipt at step 1
s = await session(); await s.jump(1)
await s.id('quick-send').click(); await s.settle()
await s.id('send-other-bank').click(); await s.settle()
await s.id('bank-CRDB Bank').click(); await s.settle()
await s.id('bank-account').fill('0152 4876 39100'); await s.id('bank-name').fill('Baraka Mwakyusa')
await s.id('bank-continue').click(); await s.settle(900); await s.id('bank-continue').click()
await s.type(50000); await s.id('comment').fill('For the order')
await s.id('amount-primary').click(); await s.settle(); await s.id('sheet-confirm').click(); await s.otp()
await s.shot('06-send-tips-receipt')
await s.close()

// Cash code at step 3
s = await session(); await s.jump(3); await s.payments()
await s.id('pay-cash').click(); await s.settle(); await s.id('cash-agent').click()
await s.type(50000); await s.id('amount-primary').click(); await s.settle(); await s.id('sheet-confirm').click(); await s.settle(1000)
await s.shot('07-cash-code')
await s.close()

// Airtime at step 4 (Balance TZS 900,000)
s = await session(); await s.jump(4); await s.payments()
await s.id('pay-airtime').click(); await s.shot('08-airtime-recipients')
await s.id('airtime-row').filter({ hasText: 'Neema Mushi' }).click(); await s.type(5000)
await s.shot('09-airtime-amount')
await s.close()

// Government bill at step 5 (Balance TZS 895,000)
s = await session(); await s.jump(5); await s.payments()
await s.id('pay-gov').click(); await s.shot('10-gov-institutions')
await s.id('inst-tra').click(); await s.settle(); await s.id('gov-control-input').fill('991081123890')
await s.page.locator('input').blur(); await s.id('gov-continue').click()
await s.shot('11-gov-bill')
await s.close()

// Bills at step 6 (Balance TZS 695,000)
s = await session(); await s.jump(6); await s.payments()
await s.id('pay-bills').click(); await s.shot('12-bills-billers')
await s.id('bills-saved-meter').click(); await s.settle(); await s.id('meter-continue').click()
await s.type(20000); await s.id('amount-primary').click(); await s.settle(); await s.id('sheet-confirm').click(); await s.otp()
await s.shot('13-bills-receipt')
await s.close()
await browser.close()

// Side-by-side page for the product owner.
const names = readdirSync(`${OUT}ours`).filter((f) => f.endsWith('.png')).sort()
const rows = names
  .map((f) => {
    const n = f.replace('.png', '')
    return `<section><h2>${n} <small>Figma ${FIGMA_NODES[n] ?? ''}</small></h2><div class="pair"><figure><img src="figma/${f}"><figcaption>Figma</figcaption></figure><figure><img src="ours/${f}"><figcaption>Build</figcaption></figure></div></section>`
  })
  .join('\n')
writeFileSync(
  `${OUT}index.html`,
  `<!doctype html><meta charset="utf-8"><title>Visual QA</title><style>body{font:14px -apple-system,system-ui,sans-serif;background:#f4f4f6;margin:24px}section{margin:0 0 32px}h2{font-size:16px}small{color:#888;font-weight:400}.pair{display:flex;gap:16px;flex-wrap:wrap}figure{margin:0}img{width:402px;border-radius:12px;box-shadow:0 2px 12px #0002}figcaption{color:#666;margin-top:4px}</style><h1>Visual QA — Figma vs build (402 × 874)</h1><p>See qa/README.md for intended differences.</p>${rows}`,
)
console.log('qa/index.html written')
