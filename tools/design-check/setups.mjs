// Hand-written part of design/screen-map.json: how to reach each ★ Figma screen in the app.
// `npm run design:map` merges this with design/figma-export/manifest.json into design/screen-map.json.
//   step:     Master demo script state to start from (Jump to step N)
//   actions:  window.__demo.run() vocabulary (src/app/testHook.ts)
//   keyboard: the Figma frame draws the iOS keyboard; the app draws its own keypad → mask y ≥ 556, skip texts there
//   mask:     extra dynamic areas [x, y, w, h] for the visual diff (device time, dates, "until HH:MM")
//   deviations: Figma text → app text (null = not shown), on top of tools/design-check/deviations.json
//   ignore:   Figma texts to leave out (e.g. drawn keyboard keys)
const STATUS = [0, 0, 402, 44]
// Figma annotation badges (blue numbered circles) on the Home and Payments frames.
const HOME_BADGES = [[280, 172, 34, 34], [74, 196, 34, 34], [208, 196, 34, 34], [342, 196, 34, 34], [62, 336, 34, 34], [40, 682, 34, 34]]

const FUND_AMOUNT = ['tap:quick-fund', 'tap:fund-mpesa']

// Fund amount header: the app keeps the BRD title (texts.ts), Figma says just "M-Pesa".
const FUND_HEADER = { 'M-Pesa': 'Top up from M-Pesa' }

export const SETUPS = {
  // ── 00 Home & Payments ──────────────────────────────────────────────
  '1:3556': { step: 0, actions: [], mask: [STATUS, ...HOME_BADGES], deviations: { 'LUKU electricity': 'Water', Bills: 'Bills · DAWASA' } },
  '1:4211': { step: 0, actions: ['payments'], mask: [STATUS, [40, 196, 34, 34], [40, 258, 34, 34], [40, 320, 34, 34], [40, 442, 34, 34], [40, 504, 34, 34], [40, 566, 34, 34], [40, 628, 34, 34]] },

  // ── 01 Fund my account (from the seed, as in step 1) ──────────────
  '49:10338': { step: 0, actions: ['tap:quick-fund'], deviations: { 'Transfer to your account number via TIPS': 'Instant via TIPS' } },
  '49:4304': { step: 0, actions: [...FUND_AMOUNT, 'amount:50000'], keyboard: true , deviations: FUND_HEADER },
  '55:12543': {
    step: 0,
    actions: [...FUND_AMOUNT, 'amount:6000000'],
    keyboard: true,
    deviations: FUND_HEADER,
    // This frame puts the header text at x = 80, its sibling 49:4304 at x = 94; the app follows 49:4304.
    known: { 'Top up from M-Pesa': 'Figma header x differs between Fund frames (A1)', '+255 75• ••• 412': 'Figma header x differs between Fund frames (A1)' },
  },
  '50:3093': {
    step: 0,
    actions: [...FUND_AMOUNT, 'amount:50000', 'continue'],
    deviations: FUND_HEADER,
    // Half of this sheet's texts sit at x = 36, the rest and every other sheet at x = 28 (A2).
    known: Object.fromEntries(['Top up from M-Pesa', 'Amount', 'From', 'M-Pesa +255 75• ••• 412', 'Fee', 'No fee'].map((k) => [k, 'Figma sheet text at x = 36, all other sheets x = 28 (A2)'])),
  },
  // Figma draws this state without the prompt; the app opens the prompt at once (BRD), so mask it.
  '49:4738': { step: 0, actions: [...FUND_AMOUNT, 'amount:50000', 'continue', 'confirm'], mask: [STATUS, [0, 280, 402, 300]] },
  '50:3741': { step: 0, actions: [...FUND_AMOUNT, 'amount:50000', 'continue', 'confirm'] },
  '49:4942': { step: 0, actions: [...FUND_AMOUNT, 'amount:50000', 'continue', 'confirm', 'tap:mpesa-send', 'push'] },
  '50:1357': {
    step: 0,
    actions: [...FUND_AMOUNT, 'amount:50000', 'continue', 'confirm', 'tap:mpesa-cancel'],
    deviations: { 'The M-Pesa prompt was declined or the PIN was wrong. No money was taken': 'The M-Pesa prompt was declined or the PIN was wrong. No money was taken.' },
  },
  '50:2011': { step: 0, actions: [...FUND_AMOUNT, 'amount:600000', 'continue', 'confirm', 'tap:mpesa-send', 'push'] },
  '50:2455': { step: 0, actions: [...FUND_AMOUNT, 'amount:25000', 'continue', 'confirm', 'tap:mpesa-send', 'push'] },
  '67:3935': { step: 0, actions: [...FUND_AMOUNT, 'amount:50000', 'continue', 'confirm', 'tap:mpesa-send', 'push', 'tap:result-primary', 'push'] },
}
