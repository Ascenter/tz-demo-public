import { test, expect } from '@playwright/test'
import { typeAmount, expectPush, goHome } from './helpers'

// After the first load the service worker precaches everything: the app must run in airplane mode.
test.use({ serviceWorkers: 'allow' })

test('works offline after the first load (precached PWA)', async ({ page, context }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto('/?reset=1')
  await expect(page.getByTestId('home')).toBeVisible()
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((r) => navigator.serviceWorker.addEventListener('controllerchange', () => r(), { once: true }))
    }
  })

  await context.setOffline(true)
  await page.reload()
  await expect(page.getByTestId('home')).toBeVisible()
  await expect(page.getByTestId('balance-available')).toHaveText('910,000')

  // A full flow offline, including the lazy-loaded scanner chunk.
  await page.getByTestId('quick-fund').click()
  await page.getByTestId('fund-mpesa').click()
  await typeAmount(page, 50_000)
  await page.getByTestId('amount-primary').click()
  await page.getByTestId('sheet-confirm').click()
  await page.getByTestId('mpesa-send').click()
  await expectPush(page, 'TZS 50,000 added')
  await page.getByTestId('result-primary').click()
  await goHome(page)
  await expect(page.getByTestId('balance-available')).toHaveText('960,000')
  await page.getByTestId('quick-scan').click()
  await expect(page.getByTestId('scanner')).toBeVisible()
  // Headless has no camera: the scanner falls back to "Simulate scan"; the lazy chunk must load offline.
  await expect(page.getByTestId('simulate-scan')).toBeVisible()
  expect(errors).toEqual([])
  await context.setOffline(false)
})

test('manifest makes it installable (standalone, portrait, icons)', async ({ request }) => {
  const res = await request.get('/manifest.webmanifest')
  expect(res.ok()).toBe(true)
  const m = await res.json()
  expect(m).toMatchObject({ name: 'Mo-Simba', short_name: 'Mo-Simba', display: 'standalone', orientation: 'portrait' })
  expect(m.icons.map((i: { sizes: string }) => i.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']))
  expect((await request.get('/apple-touch-icon.png')).ok()).toBe(true)
})
