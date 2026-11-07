# Mo-Simba payments demo (Tanzania)

A web demo of the Mo-Simba Bank mobile app's payment flows. It runs fully in the browser on scripted mocks: there is no backend, and nothing goes over the network after the first load. It installs on an iPhone as a full-screen PWA for the mid-December 2026 presentation.

**Source of truth:** the parent BRD v16 and seven child BRDs (Confluence, FF space) as of 7 Nov 2026 set values, texts and behaviour. Figma file `ihcteWxkN7OtuBaC3Q4RVA` sets layout and visuals. Gaps and decisions are listed in [`ASSUMPTIONS.md`](ASSUMPTIONS.md).

## Quick start

```bash
npm install
npm run dev            # http://localhost:5173 — desktop shows a 402 × 874 device frame
```

| Script                            | What it does                                                                                    |
| --------------------------------- | ----------------------------------------------------------------------------------------------- |
| `npm run dev`                     | Dev server with hot reload                                                                      |
| `npm run dev:https`               | HTTPS dev server on the LAN, for camera testing on a phone (accept the self-signed certificate) |
| `npm run build`                   | Type-check and build a static `dist/` with the service worker                                   |
| `npm run preview`                 | Serve `dist/` locally                                                                           |
| `npm test`                        | Vitest: engine, validators, formatters, OTP, Jump-to-step snapshots                             |
| `npm run e2e`                     | Playwright: Master demo script and edge cases (WebKit, iPhone 15 Pro), offline check (Chromium) |
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

Scripted inputs: OTP **123456** · Send search `0784 552 019` and `Nee` · TIPS account `0152 4876 39100` · Airtime not-found number `0799 000 111` · GePG `9910 8112 3890` (not found: `…3809`) · LUKU meter `0123 4567 890` (not found: `…899`) · M-Pesa: over 500,000 → "Not enough on M-Pesa", exactly 25,000 → "in progress", Cancel in the prompt → declined.

### Hidden demo menu (presenter only)

Open it with a **long press (1 s) on the Home balance** or a **triple tap on the status bar**. It offers:

- **Agent entered the code**: only while the cash code screen is open.
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

## Known limitations

- Icons are hand-drawn, and the lion illustrations are placeholders. The Figma asset URLs on `www.figma.com` were blocked in the build environment. To swap in the real assets, edit `src/components/icons.tsx` and `src/components/Illustration.tsx`.
- The offline e2e runs in Chromium, because Playwright's WebKit on Linux can't do an offline reload. Check airplane mode on the real iPhone (step 4 above).
