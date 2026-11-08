import { test, expect } from '@playwright/test'
import { launchFresh, typeAmount, enterOtp, expectPush, expectStep, goHome, goPayments, openDemoMenu } from './helpers'

// Rules outside the Master script: OTP limits, scripted M-Pesa failures, idempotent confirm,
// cash Cancel code and double-tap Done, Bills → Fund my account return, presenter tools.

test.beforeEach(async ({ page }) => {
  await launchFresh(page)
})

test('OTP: wrong code shows the field error; 3rd wrong cancels with no debit (parent BR-09)', async ({ page }) => {
  await page.getByTestId('quick-send').click()
  await page.getByTestId('send-search').fill('Nee')
  await page.getByTestId('search-results').getByTestId('recipient-row').first().click()
  await typeAmount(page, 10_000)
  await page.getByTestId('amount-primary').click()
  await enterOtp(page, '111111')
  await expect(page.getByTestId('otp-error')).toHaveText('Wrong code')
  await expect(page.getByTestId('otp-boxes')).not.toContainText('1') // cleared at once for re-entry
  await enterOtp(page, '222222')
  await expect(page.getByTestId('otp-error')).toHaveText('Wrong code')
  await enterOtp(page, '333333')
  await expect(page.getByTestId('toast')).toHaveText('Too many attempts')
  await expect(page.getByTestId('otp-screen')).toHaveCount(0) // back to the amount, nothing sent
  await page.getByTestId('send-amount').getByTestId('nav-back').click()
  await expect(page.getByTestId('send-amount')).toHaveCount(0)
  await page.getByTestId('send-recipients').getByTestId('nav-back').click()
  await expectStep(page, 0)
})

test('OTP: "Send new code" resets the attempts', async ({ page }) => {
  await page.getByTestId('quick-send').click()
  await page.getByTestId('send-search').fill('Nee')
  await page.getByTestId('search-results').getByTestId('recipient-row').first().click()
  await typeAmount(page, 10_000)
  await page.getByTestId('amount-primary').click()
  await enterOtp(page, '000000')
  await enterOtp(page, '000000')
  await page.getByTestId('otp-resend').click()
  await expect(page.getByTestId('toast')).toHaveText('New code sent')
  await enterOtp(page, '000000') // would be the 3rd wrong without the reset
  await expect(page.getByTestId('otp-error')).toHaveText('Wrong code')
  await enterOtp(page, '123456')
  await expectPush(page, 'TZS 10,000 sent to Neema Mushi')
})

test('Fund: declined prompt → Try again → success; double taps credit once', async ({ page }) => {
  await page.getByTestId('quick-fund').click()
  await page.getByTestId('fund-mpesa').click()
  await typeAmount(page, 50_000)
  await page.getByTestId('amount-primary').click()
  await page.getByTestId('sheet-confirm').dblclick()
  await page.getByTestId('mpesa-cancel').click()
  await expect(page.getByTestId('result-title')).toHaveText("Top-up didn't go through")
  await expect(page.getByTestId('result-body')).toHaveText('The M-Pesa prompt was declined or the PIN was wrong. No money was taken.')
  await page.getByTestId('result-primary').click() // Try again
  await expect(page.getByTestId('mpesa-prompt')).toContainText('Pay TZS 50,000')
  await page.getByTestId('mpesa-send').dblclick()
  await expect(page.getByTestId('result-title')).toHaveText('TZS 50,000 added')
  await page.getByTestId('result-primary').click()
  await goHome(page)
  await expect(page.getByTestId('balance-available')).toHaveText('960,000')
  await expect(page.getByTestId('feed-row').filter({ hasText: 'Top up from M-Pesa' })).toHaveCount(1)
})

test('Fund: exactly 25,000 → "Top-up in progress"; Got it credits it (Fund BR-06)', async ({ page }) => {
  await goPayments(page)
  await page.getByTestId('pay-fund').click()
  await page.getByTestId('fund-mpesa').click()
  await typeAmount(page, 25_000)
  await page.getByTestId('amount-primary').click()
  await page.getByTestId('sheet-confirm').click()
  await page.getByTestId('mpesa-send').click()
  await expect(page.getByTestId('result-title')).toHaveText('Top-up in progress')
  await page.getByTestId('result-primary').click()
  await expectPush(page, 'TZS 25,000 added')
  await expect(page.getByTestId('payments')).toBeVisible() // back to where it started
  await goHome(page)
  await expect(page.getByTestId('balance-available')).toHaveText('935,000')
})

async function openCashCode(page: import('@playwright/test').Page) {
  await goPayments(page)
  await page.getByTestId('pay-cash').click()
  await page.getByTestId('cash-agent').click()
  await typeAmount(page, 50_000)
  await page.getByTestId('amount-primary').click()
  await page.getByTestId('sheet-confirm').click()
  await expect(page.getByTestId('cash-code-value')).toHaveText('482 913')
}

test('Cash: Cancel code goes to Payments with no debit and no new row (Cash BR-10)', async ({ page }) => {
  await openCashCode(page)
  await page.getByTestId('result-secondary').click() // Cancel code
  await expect(page.getByTestId('payments')).toBeVisible()
  await expectStep(page, 0)
  await expect(page.getByTestId('feed-row').filter({ hasText: 'Wakala agent' })).toHaveCount(0)
})

test('Cash: a double tap on Done makes one debit and one row (Cash BR-09)', async ({ page }) => {
  await openCashCode(page)
  await page.getByTestId('result-primary').dblclick()
  await expect(page.getByTestId('home')).toBeVisible()
  await expect(page.getByTestId('balance-available')).toHaveText('860,000')
  await expect(page.getByTestId('feed-row').filter({ hasText: 'Wakala agent, Juma Shop' })).toHaveCount(1)
  await expect(page.getByTestId('today-header')).toHaveText('Today, TZS 153,500')
})

test('Bills: "Fund my account" opens Fund and returns to the amount, cleared (Bills BR-13)', async ({ page }) => {
  await goPayments(page)
  await page.getByTestId('pay-bills').click()
  await page.getByTestId('bills-saved-meter').click() // saved meter: owner shown, no lookup
  await expect(page.getByTestId('meter-owner')).toHaveText('Meter owner: Juma Mrisho')
  await page.getByTestId('meter-continue').click()
  await typeAmount(page, 950_000)
  await expect(page.getByTestId('red-line')).toHaveText('Not enough money. Balance TZS 910,000')
  await page.getByTestId('amount-primary').click() // Fund my account
  await expect(page.getByTestId('fund-methods')).toBeVisible()
  await page.getByTestId('fund-methods').getByTestId('nav-back').click()
  await expect(page.getByTestId('fund-methods')).toHaveCount(0)
  await expect(page.getByTestId('bills-amount')).toBeVisible()
  await expect(page.getByTestId('amount-value')).toHaveText(/^\s*0$/)
})

test('Demo menu: Jump to step 4, then Reset to seed', async ({ page }) => {
  await openDemoMenu(page)
  await page.getByTestId('demo-jump-4').click()
  await expect(page.getByTestId('toast')).toHaveText('State set to after step 4')
  await expectStep(page, 4)
  await openDemoMenu(page)
  await page.getByTestId('demo-reset').click()
  await expect(page.getByTestId('demo-reset')).toContainText('Tap again to reset')
  await page.getByTestId('demo-reset').click()
  await expect(page.getByTestId('home')).toBeVisible()
  await expectStep(page, 0)
})

test('Demo menu opens with a long press on the balance', async ({ page }) => {
  const box = await page.getByTestId('balance').boundingBox()
  if (!box) throw new Error('no balance')
  await page.mouse.move(box.x + box.width / 2, box.y + 20)
  await page.mouse.down()
  await page.waitForTimeout(1200)
  await page.mouse.up()
  await expect(page.getByTestId('demo-menu')).toBeVisible()
})
