// TIPS "Select bank" list. Assumption: CRDB Bank is scripted; the rest mirror the Figma frame 42:5319
// as a plausible list (see ASSUMPTIONS.md). Every bank returns the same scripted name check.
export const BANKS = [
  'CRDB Bank',
  'NMB Bank',
  'NBC Bank',
  'Stanbic Bank',
  'Absa Bank Tanzania',
  'Exim Bank',
  'Equity Bank',
  'DTB Bank',
] as const

/** Initials on the bank avatars, as drawn in Figma 42:5319. */
export const BANK_INITIALS: Record<string, string> = {
  'CRDB Bank': 'CR',
  'NMB Bank': 'NM',
  'NBC Bank': 'NB',
  'Stanbic Bank': 'SB',
  'Absa Bank Tanzania': 'AB',
  'Exim Bank': 'EX',
  'Equity Bank': 'EQ',
  'DTB Bank': 'DT',
}

export const BANK_COLORS: Record<string, string> = {
  'CRDB Bank': '#1f9e48',
  'NMB Bank': '#0060a9',
  'NBC Bank': '#1d1d6b',
  'Stanbic Bank': '#0033a1',
  'Absa Bank Tanzania': '#dc0032',
  'Exim Bank': '#004b8d',
  'Equity Bank': '#a32a29',
  'DTB Bank': '#e5a00d',
}
