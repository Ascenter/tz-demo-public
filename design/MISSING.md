# Missing from the Figma export

What the offline export (`design/figma-export/`, 8 Nov 2026) does not cover, and what the app does instead.
Keep this list current when the export is refreshed.

## Screens with no ★ frame or no spec

| What | App |
|---|---|
| OTP screen (parent BR-09) | Built in the same language: large title, 6 boxes, in-app keypad. Not checked by `design:check`. |
| Push banner, toast, demo menu | Own design (iOS-like banner, black pill toast, dev-style menu). |
| Transaction details (Cash v5) | Receipt layout pushed over Home. |
| Credit / Savings / More tabs | Placeholder screens. |
| ★ frames without a spec: `61:10555` Fund Home default, `130:680` and `190:17710` Home default, `176:707`, `222:735`, `239:3789`, `234:755` Payments default | Duplicates of `1:3556` / `1:4211`, which are checked. |

## Icons not in `assets/icons/`

Hand-drawn on the 24 pt grid in `src/components/icons.tsx`, same stroke weight:

- `close` 24 pt (result screens)
- `backspace` on the in-app number pad
- `copy`

The receipt `share` icon and the scanner `gallery` and `flash` icons were pulled from the live file through the
Figma MCP on 10 Nov 2026 (`ic_share_24`, `ic_gallery_24`, `ic_flash_24`).
- the bank / TIPS name-check tick (now an initials avatar, as drawn in `43:6975`)

`spinner_gradient_20` paints its angular gradient through a `<foreignObject>`; it is redrawn as a CSS conic gradient
with the same three colours (`src/components/Loader.tsx`).

## Tokens and assets

- **Fonts.** SF Pro is not in the export (system font on Apple platforms). Off Apple platforms the stack falls back to
  `system-ui` (Inter on the CI image), so `design:check` compares positions by the closest anchor and the visual diff is
  a guide only. Run `npm run design:check:mac` for the ≤ 3 % visual target.
- **Liquid glass.** The tab bar's liquid-glass parameters (`Liquid Glass/*` sizes) have no CSS equivalent; the app uses
  translucent white + `backdrop-filter` blur.
- **People's avatar colours.** Figma colours each initials avatar by hand; there is no token per person. The app picks
  a stable colour from the category palette by name.
- **Illustrations** come as @3x PNG on white (no alpha); they are drawn with `mix-blend-mode: multiply` so they also sit
  on the light-grey receipt paper.
- **iOS keyboard.** Frames draw the system keyboard. The app uses its own number pad on amount/OTP screens and the
  native keyboard for text fields, so `design:check` masks y ≥ 556 on those screens and ignores texts drawn there.
- **Camera.** Scanner frames show a photo; the app shows the live camera (masked in the visual diff).
