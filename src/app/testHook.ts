// Test-only hook for design:check and Playwright: `window.__demo`.
// Exposed in dev/test builds, or in production with `?e2e=1`. It drives the real UI (clicks, typing),
// so a screen is reached the same way a presenter reaches it; nothing here changes app behaviour.
import { useDemo } from './store'
import { useUi } from './ui'
import { OTP } from '../mock/scripted'

type Action = string

export interface DemoHook {
  /** Balance and history after step N of the Master demo script (same as the demo menu). */
  jumpToStep: (n: number) => void
  /** Run UI actions in order. See ACTIONS below for the vocabulary. */
  run: (actions: Action[]) => Promise<void>
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
/** Push/pop slide is 380 ms; sheets spring in ~300 ms. */
const SETTLE_MS = 480

function visible(el: Element): boolean {
  const r = (el as HTMLElement).getBoundingClientRect()
  return r.width > 0 && r.height > 0
}

/** Last visible element with this test id (the newest pushed screen sits last in the DOM), optionally containing text. */
function byTestId(id: string, text?: string): HTMLElement | null {
  const all = [...document.querySelectorAll<HTMLElement>(`[data-testid="${CSS.escape(id)}"]`)].filter(visible)
  const hits = text ? all.filter((e) => (e.textContent ?? '').includes(text)) : all
  return hits.at(-1) ?? null
}

/** Last visible button or link whose text is exactly `text`. */
function byText(text: string): HTMLElement | null {
  const all = [...document.querySelectorAll<HTMLElement>('button, a, [role="button"]')].filter(
    (e) => visible(e) && (e.textContent ?? '').replace(/\s+/g, ' ').trim() === text,
  )
  return all.at(-1) ?? null
}

async function waitFor<T>(fn: () => T | null, what: string, timeout = 6000): Promise<T> {
  const end = performance.now() + timeout
  for (;;) {
    const v = fn()
    if (v) return v
    if (performance.now() > end) throw new Error(`__demo: timed out waiting for ${what}`)
    await sleep(40)
  }
}

/** Set a React-controlled input's value and fire the input event React listens to. */
function fill(el: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
  setter.call(el, value)
  el.dispatchEvent(new Event('input', { bubbles: true }))
}

async function tap(id: string, text?: string) {
  const el = await waitFor(() => byTestId(id, text), `[data-testid=${id}]${text ? ` with "${text}"` : ''}`)
  el.click()
}

async function keys(digits: string) {
  for (const d of digits) await tap(`key-${d}`)
}

/**
 * Action vocabulary:
 *   tap:<testid>            click the element with this data-testid (tap:<testid>@<text> = the one containing text)
 *   text:<label>            click the button whose text is exactly <label>
 *   fill:<testid>=<value>   type into an input
 *   focus:<testid>          focus an input (search field focused state)
 *   amount:<n>              type n on the in-app keypad;  clear = delete the whole amount
 *   otp                     enter the scripted OTP
 *   push                    dismiss the push banner if shown
 *   simulateQr              presenter "Simulate QR scan" on the scanner
 *   home | payments         switch tab
 *   wait:<ms>               pause;  settle = wait for transitions
 * Shortcuts used in design/screen-map.json: openPayments, continue (amount-primary), confirm (sheet-confirm),
 * done (receipt-done), cash.agent, getCode.
 */
async function runOne(a: Action) {
  const [verb, ...restParts] = a.split(':')
  const arg = restParts.join(':')
  switch (verb) {
    case 'tap': {
      const [id, text] = arg.split('@')
      return tap(id, text)
    }
    case 'text':
      return (await waitFor(() => byText(arg), `button "${arg}"`)).click()
    case 'fill': {
      const [id, ...v] = arg.split('=')
      const el = await waitFor(() => byTestId(id) as HTMLInputElement | null, `input ${id}`)
      el.focus()
      return fill(el, v.join('='))
    }
    case 'focus':
      return (await waitFor(() => byTestId(arg) as HTMLInputElement | null, `input ${arg}`)).focus()
    case 'amount':
      return keys(arg)
    case 'clear':
      for (let i = 0; i < 10; i++) await tap('key-del')
      return
    case 'otp':
      await waitFor(() => byTestId('otp-screen'), 'OTP screen')
      await sleep(SETTLE_MS)
      return keys(OTP.code)
    case 'push': {
      const b = byTestId('push-banner')
      if (b) b.click()
      return
    }
    case 'simulateQr':
      return (await waitFor(() => useUi.getState().simulateScan, 'scanner'))()
    case 'home':
    case 'openHome':
      return byTestId('home') ? undefined : tap('tab-home')
    case 'payments':
    case 'openPayments':
      return byTestId('payments') ? undefined : tap('tab-payments')
    case 'continue':
      return tap('amount-primary')
    case 'confirm':
      return tap('sheet-confirm')
    case 'done':
      return tap('receipt-done')
    case 'cash.agent':
      return tap('cash-agent')
    case 'getCode':
      return tap('sheet-confirm')
    case 'wait':
      return sleep(Number(arg))
    case 'settle':
      return sleep(SETTLE_MS)
    default:
      throw new Error(`__demo: unknown action "${a}"`)
  }
}

export function installTestHook() {
  const enabled = import.meta.env.MODE !== 'production' || new URLSearchParams(location.search).has('e2e')
  if (!enabled) return
  const hook: DemoHook = {
    jumpToStep: (n) => useDemo.getState().jumpToStep(n),
    run: async (actions) => {
      for (const a of actions) {
        await runOne(a)
        // Let React commit and the push/pop slide finish before the next action looks for its target.
        await sleep(a.startsWith('amount') || a.startsWith('fill') ? 60 : SETTLE_MS)
      }
      // Wait for any loader to finish so the screenshot shows the answer, not the loader.
      await waitFor(() => (useUi.getState().loaderVisible ? null : true), 'loader to hide', 10000)
    },
  }
  ;(window as unknown as { __demo: DemoHook }).__demo = hook
}
