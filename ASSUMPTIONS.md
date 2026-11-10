# Assumptions

Decisions taken where the BRDs (parent v16 + 7 children, as of 7 Nov 2026) and Figma did not settle a detail.
Each one is the simplest inert version; change it in the file named.

## Data and money

| #   | Topic                                 | Decision                                                                                                                                                     | Where                      |
| --- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| A1  | Incoming money while credit is used   | Repays used credit first, then adds to own funds. Never reached in the Master script (own funds never go below 0).                                           | `src/engine/money.ts`      |
| A2  | Seed recipients' account numbers      | Neema Mushi `015011224521` (ends in 4521 as drawn in Figma 1:10250, FIGMA_VS_BRD.md), Joseph Kimaro `015055667788`, Amina Said `015099001122` (BRD gives names and phones only). Phones reuse the Airtime BRD numbers. | `src/mock/recipients.ts`   |
| A3  | TIPS bank list                        | CRDB Bank is scripted; NMB, NBC, Stanbic, Absa, Exim, Equity, DTB mirror Figma 42:5319. Any bank returns the scripted name check.                            | `src/mock/banks.ts`        |
| A4  | TIPS account number for Recent        | `0152487639100` as typed in Send S2.                                                                                                                         | `src/mock/masterScript.ts` |
| A5  | "Today" header with no outgoing money | Shows `Today, TZS 0`.                                                                                                                                        | `src/screens/Feed.tsx`     |

## Behaviour

| #   | Topic                                                 | Decision                                                                                                                                                                                                       |
| --- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | Recipient search loader (Send BR-10)                  | Inline spinner in the list, at least 200 ms, so typing is never blocked by a full-screen loader. All other backend answers use the blocking loader.                                                            |
| B2  | OTP cancelled (back, 3rd wrong code, expired)         | Returns to the previous step (amount screen or bill check) with the values kept; nothing is debited.                                                                                                           |
| B3  | Send money limits                                     | Parent wording: "Over the limit of TZS 5,000,000 per payment" and "Not enough money" (Send BRD error table).                                                                                                   |
| B4  | Gov "Not enough money" on the bill check              | Red line + disabled Pay (unreachable in the script).                                                                                                                                                           |
| B5  | Tapping a TIPS recipient in Recent                    | Goes straight to the amount; the "Check the transfer" sheet still shows (Send BR-06).                                                                                                                          |
| B6  | Airtime "My number"                                   | Row title "My number"; the same text is used as the feed name.                                                                                                                                                 |
| B7  | Cash withdrawal method choice                         | A screen with three rows (Figma section has no method sheet frame), Back → Payments.                                                                                                                           |
| B8  | Amount and OTP entry                                  | In-app keypad drawn like the Figma iOS number pad (no system keyboard jumping over the layout). Comment, search, account, control number and meter fields use the native keyboard with `inputmode`.            |
| B9  | Scanner without a camera (denied, desktop, simulator) | Shows "No camera access" + "Simulate scan" in the viewfinder, plus the demo-menu action.                                                                                                                       |
| B10 | Saving a contact on the receipt                       | Toast "Contact saved"; the "Save contact" button disappears once the account is saved.                                                                                                                         |
| B11 | Transaction details (Cash v5)                         | Only history entries that carry details open on tap: today only cash withdrawals. The details screen is the Receipt layout pushed over Home; its date is the entry's time. Other flows' entries are unchanged. |
| B12 | Feed amount for a cash withdrawal                     | Figma feed style `TZS 50,000` (currency first, no minus), the same as every other outgoing row and Figma 176:4682 (FIGMA_VS_BRD.md). The Cash BRD v5 field mapping writes "−TZS 50,000"; product owner to confirm. |

## Visual (Figma wins for layout)

| #   | Topic                                                      | Decision                                                                                                                                                                                                                                                                                              |
| --- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V1  | Currency position                                          | Currency first everywhere: Home hero `TZS 900,000` in Display Semibold 48/56 (spec 1:3556), amount entry `TZS 50,000` with the caret after the number (49:4304), feed `TZS 20,000` / `+TZS 150,000`. |
| V2  | Icons                                                      | Figma SVGs from the offline export (`npm run design:assets` → `src/assets/icons`, inlined by svgr). Glyphs the export lacks stay hand-drawn; see `design/MISSING.md`. |
| V3  | Illustrations                                              | Lion mascots from the export (WebP + PNG fallback) at their Figma pt sizes, mapped in `src/components/Illustration.tsx`. |
| V4  | Airtime contacts header                                    | "Contacts" (BRD key `payments.airtime.contacts`) instead of Figma's A/B letter groups.                                                                                                                                                                                                                |
| V5  | Airtime amount hint                                        | One BRD line "Balance TZS {available} · No fee" (Figma draws two lines). The Airtime/Data switch is hidden and its room kept (FIGMA_VS_BRD.md). |
| V6  | Bills biller order                                         | Figma order: LUKU, TV, Government payments, Water.                                                                                                                                                                                                                                                    |
| V7  | Gradients                                                  | As in the Figma layers: Home 460 pt, Payments 260 pt green, list screens 260 pt blue, amount screens blue over the whole screen, Fund and Cash method lists the method gradient over the whole screen. |
| V8  | OTP screen, loader, push banner, demo menu, result screens | No Figma frame; built in the same visual language (white surfaces, black pill buttons, SF type scale).                                                                                                                                                                                                |

## Design sync (Figma export of 8 Nov 2026)

`npm run design:check` lists each of these as an expected deviation; the setup for each screen is in `tools/design-check/setups.mjs`.

| #   | Topic | Decision |
| --- | ----- | -------- |
| F1  | Amount screen headers | Live file, 10 Nov: Fund (454:8525) and Cash (452:10654) were rebuilt with the navBar "icon" header — title at x = 80, y = 88, sheet at 154 pt, no comment slot, amount at y = 260, black M-Pesa avatar, turquoise Wakala avatar. The app follows them (`compact`). Send, Scan, Airtime and Bills frames still use the older header (title at x = 94, sheet at 156 pt) and keep it. |
| F2  | Fund confirm sheet x | Half of 50:3093's texts sit at x = 36; every other sheet uses x = 28. The app uses 28. |
| F3  | Send start screen contacts | Figma also lists phone-book contacts under A/B letter headers; the Send BRD has Recent only, so they are not built. |
| F4  | Frames that disagree with their siblings | 1:10181 and 12:6295 (list 5–15 pt lower), LUKU error frames (amount 7 pt lower). The app follows the majority. |
| F5  | Send search results | texts.ts has one header, "Results" (Figma: CONTACTS / MO-SIMBA CUSTOMER); a result found by account shows the phone, not "Account •••• 6789". |
| F6  | Send receipts | TIPS: "Save recipient" hidden (FIGMA_VS_BRD.md), Fee and Total kept as drawn in 42:5875. Internal: Sender and the sender's account as drawn in 12:5552, no fee lines. |
| F7  | Amount error states | Figma keeps the grey hints and an active button; the app shows the BRD red line in their place and disables the button (parent BR-05). |
| F8  | Buttons drawn above the iOS keyboard | Save contact, bank form, control number and meter screens: the button stays at the bottom; on the iPhone the native keyboard pushes it up. |
| F9  | Modal tint | `background/modalBG` 50 % everywhere. Some Figma sheets (Fund, Cash, LUKU confirm) stack two 50 % tints. |
| F10 | Fund "Check your phone" | The emulated M-Pesa prompt opens at once and "Send prompt again" is hidden (FIGMA_VS_BRD.md), so 49:4738 never shows without the prompt. |
| F11 | Scan confirm sheet | Lists the comment too (Scan BR-10), one row more than 130:1558, so the sheet is 58 pt taller. |
| F12 | Scanner chrome | As drawn: back and flash on top, 1x/2x/3x presets and gallery at the bottom, no viewfinder corners. "My QR" (inert in the app, not in Figma) is gone; the zoom presets are visual only. |
| F13 | TIPS amount screen and sheet | The recipient is named by the name at the bank (BARAKA JOHN MWAKYUSA), sheet labels "Recipient" / "Account" with the masked number (texts.ts); Figma uses the typed name, "Recipient (name at the bank)" and the full number. "Phone" vs Figma "Phone number". |
| F14 | Labels only Figma has | New key `payments.send_money.bank_search_hint` ("Bank name") for the inactive search on Select bank. Existing keys win elsewhere: "Banks" (Figma ALL BANKS), "Instant via TIPS" (Figma "Transfer to your account number via TIPS"), "Top up from M-Pesa" (Figma "M-Pesa"). |
| F15 | Device size | The demo targets the iPhone 15 Plus (430 × 932 pt, @3x; safe areas 59 / 34 in the desktop frame). Layouts are fluid: 20 pt margins, extra height goes to the content. `design:check` gates at the Figma 402 × 874 frame and screenshots every screen at 430 × 932 @3x for review. |
| F16 | Comment field size | 13/18 as drawn. iOS would zoom on focus below 16 px, which the viewport (`maximum-scale=1`) prevents. |
| F17 | Operator badges | Dark badge as drawn (222:1102) instead of operator colours. |
| F19 | Home feed in the live file (10 Nov) | Every Home frame is now an instance (e.g. 411:1074): feed text at x = 80 (20 pt after the icon), long titles wrap. The app follows. The category icons there are proper library icons but render pale in Figma's export; the app keeps the coloured Figma SVGs. LUKU row subtitle reads "Bills · TANESCO" in Figma; the app keeps the BRD text "Bills · Meter …". |
| F18 | Recent rows | Address-book recipients show name + Simba badge; a number found by search and not saved also shows its phone (12:6295). |

## Process

| #   | Topic                        | Decision                                                                                                                                                                                                             |
| --- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | LUKU step number             | The LUKU BRD still says "step 6, 895,000 → 875,000". The build prompt / parent Master script (step 7, 695,000 → 675,000) and the LUKU OQ-2 note are followed.                                                        |
| P2  | Offline e2e browser          | Playwright WebKit on Linux cannot serve an offline reload from the service worker, so `offline.spec.ts` runs in Chromium; every flow test runs in WebKit. Re-check airplane mode on the real iPhone before the demo. |
| P3  | Lighthouse "PWA installable" | Lighthouse 12+ removed the PWA category. Installability is covered by `offline.spec.ts` (manifest: standalone, portrait, 192/512 icons, apple-touch-icon; service worker controls the page).                         |
