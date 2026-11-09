// Copies the icons and illustrations the app uses from the offline Figma export
// (design/figma-export/assets/, gitignored) into src/assets/, normalised for the app:
//   - monochrome icons (ic_*, tab_*, *Black_52, statusbar): fills become currentColor, so CSS can recolour them;
//   - 40 pt round icons (category_*, ic_*_40, ic_unknown_bank): the circle fill becomes
//     `var(--icon-bg, <Figma colour>)`, so a row can override the circle colour as Figma does;
//   - illustrations: @3x PNG → WebP (shipped) + optimised PNG (fallback), same pixel size.
// Usage: npm run design:assets   (rerun after replacing design/figma-export/)
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs'
import sharp from 'sharp'

const SRC = new URL('../design/figma-export/assets/', import.meta.url).pathname
const OUT = new URL('../src/assets/', import.meta.url).pathname
if (!existsSync(SRC)) {
  console.error('design/figma-export/ is missing: unzip tz-figma-export.zip into design/ first.')
  process.exit(1)
}

// Icons the app renders. The spinner (foreignObject conic gradient) and the paw loader are drawn in CSS/SVG
// by the Loader component from the same colours, so they are not copied.
const MONO = [
  'ic_arrowLeft_24', 'ic_arrow_down', 'ic_arrow_right', 'ic_chat_20', 'ic_checkmark_24', 'ic_cross_close_16',
  'ic_diagram_24', 'ic_search', 'ic_search_24', 'tab_home', 'tab_payments', 'tab_credit', 'tab_savings', 'tab_more',
  'plusBlack_52', 'arrowrightBlack_52', 'qrBlack_52', 'statusbar',
]
const ROUND = [
  'category_book', 'category_car', 'category_communal', 'category_electricity', 'category_gov_payments',
  'category_health', 'category_mobile_top_up', 'category_other', 'category_percents', 'category_products',
  'category_send_to_card', 'category_topup', 'category_travel', 'category_tv', 'category_withdraw_cash',
  'ic_mobile_40', 'ic_wallet_40', 'ic_unknown_bank', 'ic_store_market_40',
]
const AS_IS = ['logo_visa_white', 'loader_paw_56']

mkdirSync(`${OUT}icons`, { recursive: true })
mkdirSync(`${OUT}illustrations`, { recursive: true })

const read = (n) => readFileSync(`${SRC}icons/${n}.svg`, 'utf8')
for (const n of MONO) {
  const svg = read(n)
    .replace(/(fill|stroke)="(?!none)[^"]*"/g, '$1="currentColor"')
  writeFileSync(`${OUT}icons/${n}.svg`, svg)
}
for (const n of ROUND) {
  // The circle colour is the first fill; every shape in that colour (circle, or circle + glyph) gets the variable.
  const src = read(n)
  const color = src.match(/fill="(#[0-9A-Fa-f]{6})"/)?.[1]
  const svg = color ? src.replaceAll(`fill="${color}"`, `style="fill: var(--icon-bg, ${color.toLowerCase()})"`) : src
  writeFileSync(`${OUT}icons/${n}.svg`, svg)
}
for (const n of AS_IS) writeFileSync(`${OUT}icons/${n}.svg`, read(n))

for (const f of readdirSync(`${SRC}illustrations`).filter((f) => f.endsWith('@3x.png'))) {
  const name = f.replace('@3x.png', '')
  const img = sharp(`${SRC}illustrations/${f}`)
  await img.clone().webp({ quality: 85, effort: 6 }).toFile(`${OUT}illustrations/${name}@3x.webp`)
  await img.clone().png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(`${OUT}illustrations/${name}@3x.png`)
}
console.log(`icons: ${MONO.length + ROUND.length + AS_IS.length}, illustrations copied to src/assets/`)
