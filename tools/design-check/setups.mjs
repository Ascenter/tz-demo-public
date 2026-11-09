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

// Send money macros (Master script step 2 order: S1 → S3 → S4 → S2).
const SEND_S1 = ['tap:quick-send', 'fill:send-search=0784 552 019', 'tap:recipient-row@Baraka M.', 'amount:50000', 'fill:comment=For the order', 'continue', 'confirm', 'otp', 'push']
const SEND_S4 = ['tap:quick-send', 'fill:send-search=Nee', 'tap:recipient-row@Neema Mushi', 'amount:35000', 'fill:comment=For lunch', 'continue', 'otp', 'push']
const TIPS_FORM = ['tap:quick-send', 'tap:send-other-bank', 'tap:bank-CRDB Bank', 'fill:bank-account=0152 4876 39100', 'fill:bank-name=Baraka Mwakyusa', 'blur']
// Figma lists phone-book contacts (letter groups) on the Send start screen; the Send BRD has Recent only (ASSUMPTIONS A3).
const SEND_CONTACTS = Object.fromEntries(
  ['Simba@649', 'Simba@853', 'A', 'B', 'Athumani Bakari', '+255 768 220 415', 'Asha Mwinyi', '+255 655 903 118', 'Bahati Mollel', '+255 742 610 093', 'AB', 'AM', 'BM'].map((k) => [k, null]),
)
// FIGMA_VS_BRD: no quick chips on Send money and Scan to pay amount screens (keyed text@y, the amount can read the same).
const CHIPS_HIDDEN = { 'TZS 10,000@520': null, 'TZS 20,000@520': null, 'TZS 50,000@520': null }
// Search result group headers: texts.ts has one key, "Results" (Figma: CONTACTS / MO-SIMBA CUSTOMER).
const RESULTS_HEADER = { CONTACTS: 'RESULTS', 'MO-SIMBA CUSTOMER': 'RESULTS' }
// The Recent list after the Master-script steps differs from this Figma frame (it shows a fresh TIPS-only history).
const RECENT_AFTER = 'Recent list holds the real Master-script recipients'
// TIPS amount and sheet: the app names the recipient by the name at the bank and uses the BRD sheet labels.
const TIPS_TEXTS = { 'Baraka Mwakyusa@90': 'BARAKA JOHN MWAKYUSA', 'BM@100': 'BJ', 'Recipient (name at the bank)': 'Recipient', 'Account number': 'Account', '0152 4876 39100': '•••• 9100' }
// Save contact frame draws the iOS keyboard; the Save button sits above it there, at the bottom in the app.
const ABOVE_KEYBOARD = 'Figma places the button above the drawn iOS keyboard'
// Send over-limit / not-enough frames keep the grey hints; the app shows the BRD red line in their place (parent BR-05).
const RED_LINE_STATE = 'BRD red line replaces the hints (parent BR-05), so the block is one line shorter'
const RED_LINE_KNOWN = (amount, balance = 'Balance TZS 1,060,000') => ({ [amount]: RED_LINE_STATE, [balance]: RED_LINE_STATE, 'No fee': RED_LINE_STATE })
const SCAN_AMOUNT = ['tap:quick-scan', 'simulateQr']
const CASH_AMOUNT = ['payments', 'tap:pay-cash', 'cash.agent']
const AIRTIME_AMOUNT = ['payments', 'tap:pay-airtime', 'tap:airtime-row@Neema Mushi']
// Airtime: one hint line "Balance … · No fee" (ASSUMPTIONS V5) and one "Contacts" header for the letter groups (V4).
const AIRTIME_HINT = { 'Balance TZS 900,000': 'Balance TZS 900,000 · No fee', 'No fee': null }
const GOV_CONTROL = ['payments', 'tap:pay-gov', 'tap:inst-tra']
const KEYBOARD_GLYPH = ['\u{100147}']

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
  '67:3935': { step: 0, actions: [...FUND_AMOUNT, 'amount:50000', 'continue', 'confirm', 'tap:mpesa-send', 'push', 'tap:result-primary', 'push'] , homeAfter: true },

  // ── 02 Send money ────────────────────────────────────────────────
  // S1, new internal recipient (from step 1)
  '124:11212': { step: 1, actions: ['tap:quick-send'], deviations: SEND_CONTACTS },
  '42:5301': { step: 1, actions: ['tap:quick-send'], deviations: SEND_CONTACTS },
  '106:11008': { step: 1, actions: ['tap:quick-send'], deviations: SEND_CONTACTS },
  // Focused-search frame: list 9–15 pt lower and 3 pt right of the other focused frames (12:4246) (A4).
  '1:10181': { step: 1, actions: ['tap:quick-send', 'focus:send-search'], keyboard: true, ignore: KEYBOARD_GLYPH, knownFrom: { y: 190, note: 'Figma list offset differs from 12:4246 (A4)' } },
  '12:4034': { step: 1, actions: ['loader:1500', 'tap:quick-send', 'fill:send-search=0784 552 019', 'wait:350'], settleMs: 100, keyboard: true },
  '12:4246': { step: 1, actions: ['tap:quick-send', 'fill:send-search=0784 552 019'], keyboard: true },
  '12:5035': { step: 1, actions: ['tap:quick-send', 'fill:send-search=0150 2345 6789'], keyboard: true, deviations: { 'Account •••• 6789': '+255 784 552 019' } },
  '12:4358': { step: 1, actions: ['tap:quick-send', 'fill:send-search=0784 552 019', 'tap:recipient-row@Baraka M.'], keyboard: true, deviations: CHIPS_HIDDEN },
  '12:4812': { step: 1, actions: [...SEND_S1.slice(0, 5)], keyboard: true, deviations: CHIPS_HIDDEN },
  '13:5899': { step: 1, actions: [...SEND_S1.slice(0, 6)], deviations: { ...CHIPS_HIDDEN, 'Phone number': 'Phone' } },
  '12:5552': { step: 1, actions: [...SEND_S1], deviations: { '🤓 Save contact': 'Save contact' } },
  '19:7357': { step: 1, actions: [...SEND_S1, 'tap:save-contact', 'fill:contact-name=Baraka Mwakyusa'], keyboard: true, known: { Save: ABOVE_KEYBOARD } },
  '12:5946': { step: 1, actions: [...SEND_S1, 'done', 'home'] , homeAfter: true },
  // This frame's list sits 5–10 pt lower than its siblings (124:11212) on the same 212 pt sheet (A4).
  '12:6295': { step: 1, actions: [...SEND_S1, 'done', 'tap:quick-send'], deviations: SEND_CONTACTS, knownFrom: { y: 230, note: 'Figma list offset differs from 124:11212 (A4)' } },
  // S4, saved recipient (after S1 + S3)
  '1:10213': { step: 1, actions: [...SEND_S1, 'done', 'tap:quick-send', 'fill:send-search=0754 318 902'], keyboard: true, deviations: RESULTS_HEADER },
  '1:10206': { step: 1, actions: ['loader:1500', 'tap:quick-send', 'fill:send-search=0754 318 902', 'wait:350'], settleMs: 100, keyboard: true },
  // FIGMA_VS_BRD: only scripted contacts, so Neema Lyimo is not in the results.
  '1:10196': { step: 1, actions: ['tap:quick-send', 'fill:send-search=Nee'], keyboard: true, ignore: KEYBOARD_GLYPH, deviations: { ...RESULTS_HEADER, 'Neema Lyimo': null, NL: null, '+255 689 334 120': null } },
  '1:10222': { step: 1, actions: [...SEND_S1, 'done', 'tap:quick-send', 'fill:send-search=0150 2345 6789'], keyboard: true, deviations: { ...RESULTS_HEADER, 'Account •••• 6789': '+255 784 552 019' } },
  // FIGMA_VS_BRD (OQ-2 a): not found = empty result list, not the Figma "not found" screen.
  '1:10231': { step: 1, actions: ['tap:quick-send', 'fill:send-search=0712 000 111'], keyboard: true, deviations: { 'No Mo-Simba customer found': null, 'Check the phone or account number and try again': null } },
  '1:10238': { step: 1, actions: [...SEND_S1, 'done', 'tap:quick-send', 'fill:send-search=Nee', 'tap:recipient-row@Neema Mushi'], keyboard: true, deviations: CHIPS_HIDDEN },
  '1:10244': { step: 1, actions: [...SEND_S1, 'done', ...SEND_S4.slice(0, 5)], keyboard: true, deviations: CHIPS_HIDDEN },
  '1:10296': { step: 1, actions: [...SEND_S1, 'done', ...SEND_S4.slice(0, 3), 'amount:6000000', 'fill:comment=For lunch'], keyboard: true, deviations: CHIPS_HIDDEN, known: RED_LINE_KNOWN('TZS 6,000,000') },
  '1:10289': { step: 1, actions: [...SEND_S1, 'done', ...SEND_S4.slice(0, 3), 'amount:1200000', 'fill:comment=For lunch'], keyboard: true, deviations: CHIPS_HIDDEN, known: RED_LINE_KNOWN('TZS 1,200,000') },
  '1:10250': { step: 1, actions: [...SEND_S1, 'done', ...SEND_S4] },
  '1:10251': { step: 1, actions: [...SEND_S1, 'done', ...SEND_S4, 'done', 'home'] , homeAfter: true },
  // S2, TIPS (after S1 + S4)
  '42:5319': { step: 1, actions: ['tap:quick-send', 'tap:send-other-bank'], deviations: { 'ALL BANKS': 'BANKS' } },
  '42:6548': { step: 1, actions: ['tap:quick-send', 'tap:send-other-bank', 'tap:bank-CRDB Bank', 'focus:bank-account'], keyboard: true, known: { Continue: ABOVE_KEYBOARD } },
  '43:7309': { step: 1, actions: ['loader:1500', ...TIPS_FORM, 'tap:bank-continue', 'wait:300'], settleMs: 100 },
  '43:6975': { step: 1, actions: [...TIPS_FORM, 'tap:bank-continue'] },
  '42:5337': { step: 1, actions: [...SEND_S1, 'done', ...SEND_S4, 'done', ...TIPS_FORM, 'tap:bank-continue', 'tap:bank-continue', 'amount:50000', 'fill:comment=For the order'], keyboard: true, deviations: { ...CHIPS_HIDDEN, ...TIPS_TEXTS } },
  '42:5343': { step: 1, actions: [...SEND_S1, 'done', ...SEND_S4, 'done', ...TIPS_FORM, 'tap:bank-continue', 'tap:bank-continue', 'amount:50000', 'fill:comment=For the order', 'continue'], deviations: { ...CHIPS_HIDDEN, ...TIPS_TEXTS } },
  '42:5875': { knownFrom: { y: 500, note: 'Save recipient is hidden (FIGMA_VS_BRD), so the rows below move up' }, step: 1, actions: [...SEND_S1, 'done', ...SEND_S4, 'done', ...TIPS_FORM, 'tap:bank-continue', 'tap:bank-continue', 'amount:50000', 'fill:comment=For the order', 'continue', 'confirm', 'otp', 'push'] },
  '42:6269': { step: 2, actions: [] , homeAfter: true },
  '51:15006': {
    step: 2,
    actions: ['tap:quick-send'],
    deviations: SEND_CONTACTS,
    known: Object.fromEntries(['Baraka Mwakyusa', 'CRDB Bank •••• 9100', 'NM', 'Neema Mushi', 'JK', 'Joseph Kimaro', 'Simba'].map((k) => [k, RECENT_AFTER])),
  },

  // ── 03 Scan to pay (from step 2) ─────────────────────────────────
  // The camera feed is live video in the app and a blurred photo in Figma: masked.
  '130:901': { step: 2, actions: ['tap:quick-scan'], mask: [STATUS, [0, 148, 402, 546]] },
  '130:1092': { step: 2, actions: ['loader:1500', 'tap:quick-scan', 'simulateQr', 'wait:200'], settleMs: 100, mask: [STATUS, [0, 148, 402, 546]] },
  '130:1204': { step: 2, actions: [...SCAN_AMOUNT], keyboard: true, deviations: CHIPS_HIDDEN },
  '130:1441': { step: 2, actions: [...SCAN_AMOUNT, 'amount:25000', 'fill:comment=For lunch'], keyboard: true, deviations: CHIPS_HIDDEN },
  '130:3566': { step: 2, actions: [...SCAN_AMOUNT, 'amount:6000000', 'fill:comment=For lunch'], keyboard: true, deviations: CHIPS_HIDDEN, known: RED_LINE_KNOWN('TZS 6,000,000', 'Balance TZS 975,000') },
  '130:3449': { step: 2, actions: [...SCAN_AMOUNT, 'amount:1000000', 'fill:comment=For lunch'], keyboard: true, deviations: CHIPS_HIDDEN, known: RED_LINE_KNOWN('TZS 1,000,000', 'Balance TZS 975,000') },
  // The app's sheet also lists the comment (Scan BR-10), one row more than Figma, so the bottom-anchored sheet is 58 pt taller.
  '130:1558': { step: 2, actions: [...SCAN_AMOUNT, 'amount:25000', 'fill:comment=For lunch', 'continue'], deviations: CHIPS_HIDDEN, knownFrom: { y: 200, note: 'sheet has the extra Comment row (Scan BR-10), so it starts 58 pt higher' } },
  '130:2154': { step: 2, actions: [...SCAN_AMOUNT, 'amount:25000', 'fill:comment=For lunch', 'continue', 'confirm', 'otp', 'push'] },
  '130:2352': { step: 3, actions: [], homeAfter: true },

  // ── 04 Cash withdrawal (from step 3) ─────────────────────────────
  '176:1053': { step: 3, actions: ['payments', 'tap:pay-cash'] },
  '176:2000': { step: 3, actions: [...CASH_AMOUNT, 'amount:50000'], keyboard: true },
  '176:5718': { step: 3, actions: [...CASH_AMOUNT, 'amount:1000000'], keyboard: true },
  '176:2233': { step: 3, actions: [...CASH_AMOUNT, 'amount:50000', 'continue'] },
  // "until HH:MM" is device time + 30 min.
  '176:2903': {
    step: 3,
    actions: [...CASH_AMOUNT, 'amount:50000', 'continue', 'getCode'],
    mask: [STATUS, [40, 463, 322, 60]],
    known: { "Show this code to any Wakala agent with your phone number. They'll pay out TZS 50,000. It works once, until 12:34": 'device time ("until HH:MM")' },
  },
  '176:4682': { step: 4, actions: [], homeAfter: true },

  // ── 05 Airtime (from step 4) ─────────────────────────────────────
  '222:919': { step: 4, actions: ['payments', 'tap:pay-airtime'], deviations: { A: 'CONTACTS', B: null }, knownFrom: { y: 740, note: 'one Contacts header instead of the A/B letter groups (V4), so the B rows sit 54 pt higher' } },
  '243:19982': { step: 4, actions: ['payments', 'tap:pay-airtime', 'fill:airtime-search=0799 000 111'], keyboard: true, ignore: KEYBOARD_GLYPH },
  '222:1102': { step: 4, actions: [...AIRTIME_AMOUNT, 'amount:5000'], keyboard: true, deviations: AIRTIME_HINT, known: { 'Balance TZS 900,000 · No fee': 'one hint line (V5) sits 8 pt under the amount, Figma\'s two lines 2 pt' } },
  '243:20231': { step: 4, actions: [...AIRTIME_AMOUNT, 'amount:600000'], keyboard: true, known: RED_LINE_KNOWN('TZS 600,000', 'Balance TZS 900,000') },
  '243:20111': { step: 4, actions: [...AIRTIME_AMOUNT, 'amount:950000'], keyboard: true, known: RED_LINE_KNOWN('TZS 950,000', 'Balance TZS 900,000') },
  '222:2075': { step: 4, actions: [...AIRTIME_AMOUNT, 'amount:5000', 'continue', 'otp', 'push'] },
  '222:2267': { step: 5, actions: [], homeAfter: true },

  // ── 06 Government bill, GePG (from step 5) ───────────────────────
  '239:4123': { step: 5, actions: ['payments', 'tap:pay-gov'] },
  '239:4506': { step: 5, actions: [...GOV_CONTROL, 'fill:gov-control-input=991081123890'], keyboard: true, known: { Continue: ABOVE_KEYBOARD } },
  '239:6979': { step: 5, actions: [...GOV_CONTROL, 'fill:gov-control-input=991081123809'], keyboard: true, known: { Continue: ABOVE_KEYBOARD } },
  '239:5938': { step: 5, actions: [...GOV_CONTROL, 'fill:gov-control-input=991081123890', 'blur', 'tap:gov-continue'] },
  '239:6670': { step: 5, actions: [...GOV_CONTROL, 'fill:gov-control-input=991081123890', 'blur', 'tap:gov-continue', 'tap:gov-pay', 'otp', 'push'] },
  // This Home frame puts the first row's text at x = 56 (other Home frames: 61–62) (A4).
  '321:12104': { step: 6, actions: [], homeAfter: true, known: { 'TRA tax': 'Figma feed text x differs from other Home frames (A4)', 'Government payment': 'Figma feed text x differs from other Home frames (A4)' } },
}
