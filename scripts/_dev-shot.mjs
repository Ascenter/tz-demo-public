import { chromium } from 'playwright'
const out = '/tmp/claude-0/-home-user/3cc397a5-9954-556b-a17a-c154310ba456/scratchpad/shots/'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 500, height: 950 } })
const errors = []
p.on('console', m => m.type() === 'error' && errors.push(m.text()))
p.on('pageerror', e => errors.push(String(e)))
await p.goto('http://localhost:5173/?reset=1')
await p.waitForTimeout(800)
const el = p.locator('#phone-screen')
await el.screenshot({ path: out + 'home.png' })
await p.getByTestId('tab-payments').click(); await p.waitForTimeout(500)
await el.screenshot({ path: out + 'payments.png' })
console.log('errors:', errors)
await b.close()
