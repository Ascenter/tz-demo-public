# Mo-Simba payments demo (Tanzania)

A web demo of the Mo-Simba Bank mobile app's payment flows. It runs fully in the browser on scripted mocks: there is no backend, and nothing goes over the network after the first load. It installs on an iPhone as a full-screen PWA for the mid-December 2026 presentation.

**Source of truth:** the parent BRD v16 and seven child BRDs (Confluence, FF space) as of 7 Nov 2026 set values, texts and behaviour. Figma file `ihcteWxkN7OtuBaC3Q4RVA` sets layout and visuals. Gaps and decisions are listed in [`ASSUMPTIONS.md`](ASSUMPTIONS.md).

## Quick start

```bash
npm install
npm run dev            # http://localhost:5173 — desktop shows an iPhone 15 Plus frame (430 × 932)
```

| Script                            | What it does                                                                                    |
| --------------------------------- | ----------------------------------------------------------------------------------------------- |
| `npm run dev`                     | Dev server with hot reload                                                                      |
| `npm run dev:https`               | HTTPS dev server on the LAN, for camera testing on a phone (accept the self-signed certificate) |
| `npm run build`                   | Type-check and build a static `dist/` with the service worker                                   |
| `npm run preview`                 | Serve `dist/` locally                                                                           |
| `npm test`                        | Vitest: engine, validators, formatters, OTP, Jump-to-step snapshots                             |
| `npm run e2e`                     | Playwright: Master demo script and edge cases (WebKit, iPhone 15 Plus), offline check (Chromium) |
| `npm run design:check`            | Compare every Figma ★ screen with the app (see [Design sync](#design-sync)); `design:check:mac` on macOS |
| `npm run design:assets` / `design:map` | Copy icons and illustrations from the Figma export; rebuild `design/screen-map.json` |
| `npm run qa`                      | Screenshots for `qa/index.html` (Figma vs build), needs `vite preview` on port 4173             |
| `npm run lint` / `npm run format` | ESLint / Prettier                                                                               |

The first e2e run on a new machine needs the browsers: `npx playwright install webkit chromium`.

## The demo, step by step

1. Open the app (or the installed icon). Launching with `?reset=1` restores the seed.
2. Run the flows in Master script order. The balance after each step is in the table below; `tests/e2e/master-script.spec.ts` checks every value.

| Step | Flow                 | Scenarios     | Available | Own funds | Today header |
| ---- | -------------------- | ------------- | --------- | --------- | ------------ |
| 0    | Reset                | seed          | 910,000   | 250,000   | 103,500      |
| 1    | Fund my account      | 1 → 2 → 3     | 1,110,000 | 450,000   | 103,500      |
| 2    | Send money           | 1 → 3 → 4 → 2 | 975,000   | 315,000   | 238,500      |
| 3    | Scan to pay          | 2 → 1         | 950,000   | 290,000   | 263,500      |
| 4    | Cash withdrawal      | 2 → 1         | 900,000   | 240,000   | 313,500      |
| 5    | Airtime              | 2 → 3 → 1     | 895,000   | 235,000   | 318,500      |
| 6    | Government bill      | 2 → 1         | 695,000   | 35,000    | 518,500      |
| 7    | Bill payments (LUKU) | 2 → 3 → 4 → 1 | 675,000   | 15,000    | 538,500      |

Scripted inputs: OTP **123456** · Send search `0784 552 019` and `Nee` · TIPS account `0152 4876 39100` · Airtime not-found number `0799 000 111` · GePG `9910 8112 3890` (not found: `…3809`) · LUKU meter `0123 4567 890` (not found: `…899`) · M-Pesa: over 500,000 → "Not enough on M-Pesa", exactly 25,000 → "in progress", Cancel in the prompt → declined · Cash: Get code / Done → code 482 913 / debit + Home, first row Juma Shop.

**Step 4, Cash withdrawal (BRD v5):** Payments → Cash withdrawal → At a Wakala agent → 1,000,000 (Not enough money) → 50,000 → Continue → Get code (482 913) → **Done** → lands on Home with "Cash withdrawal · Wakala agent, Juma Shop" first (tap the row to show the details). There is no agent approval step and no presenter action.

### Hidden demo menu (presenter only)

Open it with a **long press (1 s) on the Home balance** or a **triple tap on the status bar**. It offers:

- **Simulate QR scan**: only on the scanner. The scanner also shows "Simulate scan" when there is no camera.
- **Jump to step 0–7**: sets the balance and history to the state after that step, for rehearsing one flow.
- **Loader duration**: 200, 700 or 1500 ms.
- **Device frame**: show or hide it on desktop.
- **Reset to seed**: tap twice to confirm.
- **App version and build date.**

## Install on the iPhone (for the demo)

1. Deploy `dist/` to any static **HTTPS** host. The camera and the service worker both need HTTPS.
2. On the iPhone, open the URL in **Safari** → Share → **Add to Home Screen**.
3. Open the app once from the icon and allow the camera on the scanner. After this first load, everything is cached.
4. Before going live: turn on airplane mode and open the app to confirm it works offline. Then use **Reset to seed**.

The app opens full screen in portrait, with no browser UI and no update prompts during the demo. A new deploy applies on the next launch.

### GitHub Pages (set up)

`.github/workflows/pages.yml` runs the unit tests, builds with `BASE_PATH=/<repo>/` and publishes on every push to `main`.
One-time: repo **Settings → Pages → Build and deployment → Source: GitHub Actions**. The URL is
`https://<owner>.github.io/<repo>/` (private repos need a paid GitHub plan for Pages).
For a local sub-path build: `BASE_PATH=/tz-payments-demo/ npm run build`.

### Deploying `dist/`

Any static host works; the app uses an in-memory router, so no rewrite rules are needed:

- **Netlify:** `npx netlify deploy --prod --dir dist`, or drag `dist/` into the Netlify UI.
- **Vercel:** `npx vercel deploy dist --prod`.
- **Cloudflare Pages:** `npx wrangler pages deploy dist`.
- **GitHub Pages:** serve `dist/` from the site root, so that `/sw.js` sits at the root.

Serve `sw.js` with `Cache-Control: no-cache`, so a new build is picked up on the next launch.

## Changing demo data

All demo data is in `src/mock/`. Components contain no magic values.

| Change                                                                                    | File                                                 |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Customer, seed balance, seed history                                                      | `src/mock/seed.ts`                                   |
| Scripted values: OTP, M-Pesa wallet, references, cash code, control number, meter, token… | `src/mock/scripted.ts`                               |
| Minimum, flow maximums, quick chips                                                       | `src/mock/limits.ts`                                 |
| Send recipients, Airtime contacts                                                         | `src/mock/recipients.ts`                             |
| Operators by prefix                                                                       | `src/mock/operators.ts`                              |
| Banks, billers, GePG institutions                                                         | `src/mock/banks.ts`, `billers.ts`, `institutions.ts` |
| Feed entries per flow                                                                     | `src/mock/operations.ts`                             |
| Master script steps and expected balances (Jump to step, e2e)                             | `src/mock/masterScript.ts`                           |
| **Every user-facing string**, keyed like the BRD Lokalise keys                            | `src/mock/texts.ts`                                  |

When a BRD changes, edit `src/mock/*.ts` and run `npm test && npm run e2e`; nothing needs rebuilding by hand. If a balance in the Master script changes, update `expected` in `masterScript.ts`, and both test suites follow it.

## How it is built

```
src/
  app/         phone shell, router (memory router + iOS slide), tab bar, store (zustand + persist), demo menu, overlays
  engine/      money.ts (ledger, own funds first), validate.ts (min → max → balance), otp.ts, format.ts, clock.ts, delay.ts (simulate)
  mock/        all demo data and texts
  components/  AmountEntry, Keypad, BottomSheet, OtpScreen, Receipt, ResultScreen, ListRow, NavBar, Fields, icons…
  flows/       fund/ send/ scan/ cash/ airtime/ gov/ bills/ — one folder per child BRD
  screens/     Home, Payments, Credit/Savings/More placeholders
tests/         unit/*.test.ts, e2e/*.spec.ts
qa/            Figma vs build screenshots (open qa/index.html)
```

Shared rules the code follows:

- **One ledger.** Every flow calls `spend()` or `receive()` in `src/app/store.ts`; nothing else changes balances.
- **Simulated backend.** Every backend answer goes through `simulate()`, which shows the loader for at least 200 ms.
- **Idempotent confirm.** Confirm buttons lock on the first tap.
- **Own back stack.** Each flow has its own back stack: the back icon and the iOS left-edge swipe both go to the previous step from the BRD Navigation tables.
- **Versioned storage.** State persists in `localStorage` under the key `mo-simba-demo` (version 1).

## Design sync

The app follows the Figma file `ihcteWxkN7OtuBaC3Q4RVA` through an **offline export**: this environment cannot reach figma.com, and nothing in the code, tests or tooling calls it.

- **Where it lives.** Unzip `tz-figma-export.zip` into `design/`, so that `design/figma-export/` exists. The folder is gitignored (the repo is public) and is never shipped: it is outside `public/` and not in the PWA precache. Only the assets the app uses are copied into `src/assets/` (`npm run design:assets`).
- **Rules.** `design/figma-export/FIGMA_VS_BRD.md`: the BRD wins for values and texts, Figma for visuals. Decisions are in `ASSUMPTIONS.md` (section *Design sync*); gaps in the export are in `design/MISSING.md`.
- **Screen map.** `design/screen-map.json` has one entry per ★ screen with a spec (84): Figma id, PNG, spec, how to reach it (`setup`: Jump to step N + UI actions) and masks for dynamic areas. It is generated from `tools/design-check/setups.mjs` by `npm run design:map`. Test builds expose `window.__demo` (`jumpToStep(n)`, `run(actions)`; production builds only with `?e2e=1`), so any screen opens directly. `?device=figma&bare=1` renders the bare 402 × 874 Figma frame.

### Running the check

```bash
npm run design:check                       # all screens (~15 min); builds, serves on :4174, WebKit
npm run design:check -- --flow 04          # one flow (folder prefix), or --screen 176:2903,176:2233
npm run design:check -- --no-430 --no-visual   # faster: spec conformance only
npm run design:check:mac                   # on macOS (SF Pro installed): adds the ≤ 3 % visual target
```

It exits non-zero when a screen misses the gate. Output goes to `qa/design/` (gitignored).

### Reading the report

Open `qa/design/report.html`. One row per screen, worst visual mismatch first: **Figma | app (402 × 874) | diff | iPhone 15 Plus (430 × 932 @3x)**.

- **Spec conformance (A) is the gate**: every text in the spec must be found by its exact text and drawn within ±3 pt (closest of left / centre / right edge, since fonts differ off macOS), with the same size, line height, weight, tracking (±0.1) and colour including alpha. Target ≥ 95 % per screen. Mismatches are listed as *text → expected vs actual*.
- **Expected deviations** (BRD texts, device time, known Figma inconsistencies) are listed per screen and not counted. Each one is explained in `ASSUMPTIONS.md` or `tools/design-check/deviations.json`.
- **Visual diff (B) is a guide** off macOS (no SF Pro). Masks: status bar, the drawn iOS keyboard (y ≥ 556), dates and the camera. Large numbers on the scanner, the Fund waiting screen and the confirm sheets are explained in `ASSUMPTIONS.md` (F9, F10, F12).
- **iPhone 15 Plus**: a warning appears when anything sticks out horizontally or text is clipped at 430 pt.

### Refreshing the export

1. Replace `design/figma-export/` with the new export.
2. `npm run design:assets` if icons or illustrations changed; update `src/styles/tokens.css` if `tokens/tokens.json` changed.
3. Add or adjust setups in `tools/design-check/setups.mjs` for new ★ screens (`npm run design:map` lists those without one).
4. `npm run design:check`, fix, then `npm test && npm run e2e`.

## Known limitations

- A few glyphs the Figma export does not include are hand-drawn (`design/MISSING.md`).
- The offline e2e runs in Chromium, because Playwright's WebKit on Linux can't do an offline reload. Check airplane mode on the real iPhone (step 4 above).
