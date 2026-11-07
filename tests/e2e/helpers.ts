import { expect, type Page } from '@playwright/test'
import { MASTER_SCRIPT } from '../../src/mock/masterScript'

const fmt = (n: number) => n.toLocaleString('en-US')

export async function launchFresh(page: Page) {
  await page.goto('/?reset=1')
  await expect(page.getByTestId('home')).toBeVisible()
  // Fastest loader the presenter can pick (still ≥ 200 ms, parent BR-03).
  await openDemoMenu(page)
  await page.getByTestId('demo-loader-200').click()
  await page.getByTestId('demo-close').click()
  await expect(page.getByTestId('demo-menu')).toBeHidden()
}

/** Triple tap on the status bar area opens the hidden demo menu. */
export async function openDemoMenu(page: Page) {
  const bar = page.getByTestId('status-bar')
  await bar.click()
  await bar.click()
  await bar.click()
  await expect(page.getByTestId('demo-menu')).toBeVisible()
}

export async function demoAction(page: Page, testId: string) {
  await openDemoMenu(page)
  await page.getByTestId(testId).click()
  await expect(page.getByTestId('demo-menu')).toBeHidden()
}

/** Wait for the push/pop slide to finish: exactly one keypad on screen. */
async function settled(page: Page) {
  await expect(page.getByTestId('key-0')).toHaveCount(1)
}

/** Type an amount on the in-app keypad. */
export async function typeAmount(page: Page, n: number) {
  await settled(page)
  for (const d of String(n)) await page.getByTestId(`key-${d}`).click()
  await expect(page.getByTestId('amount-value')).toHaveText(new RegExp(fmt(n)))
}

export async function clearAmount(page: Page) {
  await settled(page)
  const del = page.getByTestId('key-del')
  for (let i = 0; i < 10; i++) await del.click()
  await expect(page.getByTestId('amount-value')).toHaveText(/^\s*0$/)
}

export async function expectRedLine(page: Page, text: string) {
  await expect(page.getByTestId('red-line')).toHaveText(text)
}

export async function enterOtp(page: Page, code = '123456') {
  await expect(page.getByTestId('otp-screen')).toBeVisible()
  await settled(page)
  for (const d of code) await page.getByTestId(`key-${d}`).click()
}

/** Assert the simulated push text (parent BR-12), then tap it away. */
export async function expectPush(page: Page, text: string) {
  await expect(page.getByTestId('push-text')).toHaveText(text)
  await page.getByTestId('push-banner').click()
  await expect(page.getByTestId('push-banner')).toBeHidden()
}

export async function goHome(page: Page) {
  if (!(await page.getByTestId('home').isVisible())) await page.getByTestId('tab-home').click()
  await expect(page.getByTestId('home')).toBeVisible()
}

export async function goPayments(page: Page) {
  if (!(await page.getByTestId('payments').isVisible())) await page.getByTestId('tab-payments').click()
  await expect(page.getByTestId('payments')).toBeVisible()
}

/** The three values of the Master demo script table, read from Home. */
export async function expectStep(page: Page, step: number) {
  const e = MASTER_SCRIPT[step].expected
  await goHome(page)
  await expect(page.getByTestId('balance-available')).toHaveText(fmt(e.available))
  await expect(page.getByTestId('balance-own')).toHaveText(`TZS ${fmt(e.ownFunds)}`)
  await expect(page.getByTestId('balance-credit')).toHaveText('TZS 660,000')
  await expect(page.getByTestId('today-header')).toHaveText(`Today, ${fmt(e.today)} TZS`)
}

export async function expectFirstFeedRow(page: Page, title: string, subtitle: string, amount: string) {
  const row = page.getByTestId('feed-row').first()
  await expect(row).toContainText(title)
  await expect(row).toContainText(subtitle)
  await expect(row.getByTestId('feed-amount')).toHaveText(amount)
}
