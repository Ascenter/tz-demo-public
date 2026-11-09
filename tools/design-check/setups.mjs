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

export const SETUPS = {
  // ── 00 Home & Payments ──────────────────────────────────────────────
  '1:3556': { step: 0, actions: [], mask: [STATUS, ...HOME_BADGES], deviations: { 'LUKU electricity': 'Water', Bills: 'Bills · DAWASA' } },
  '1:4211': { step: 0, actions: ['payments'], mask: [STATUS, [40, 196, 34, 34], [40, 258, 34, 34], [40, 320, 34, 34], [40, 442, 34, 34], [40, 504, 34, 34], [40, 566, 34, 34], [40, 628, 34, 34]] },
}
