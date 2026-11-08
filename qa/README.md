# Visual QA

`index.html` shows each Figma frame (left, `figma/`) next to the build (right, `ours/`) at 402 × 874.
Regenerate: `npm run build && npx vite preview --port 4173 &` then `npm run qa`.
Figma PNGs were taken with the Figma MCP `get_screenshot` (file `ihcteWxkN7OtuBaC3Q4RVA`); node IDs are on the page.

Intended differences (see ../ASSUMPTIONS.md):

- **Amounts and dates** follow the BRD and device time, not the Figma placeholders.
- **Mascot illustrations and icons** are placeholders/hand-drawn (Figma assets could not be downloaded) — V2, V3.
- **Home first Today row** is "Water · Bills · DAWASA" (parent seed), not "LUKU electricity".
- **Airtime amount**: no Airtime/Data switch, one hint line (Airtime OQ-2 b) — V5.
- **Airtime contacts**: "Contacts" header instead of letter groups — V4.
- **Scan amount**: no quick chips (Scan BRD: "Quick amount chips — not used").
- **TIPS receipt**: no "Save recipient" (Send BRD Out of Scope).

## cash-withdrawal-v5/

Home after step 4 (real run: Done on the code screen) next to Figma 176:4682, plus the new transaction details.
Only dynamic values differ: the time on the details screen, and the rows under the first one. The Figma frame
shows just the seed rows, while the Master script also has the step 1–3 operations above them (the Today total,
313,500, already includes them and matches).
