// Scripted values registry (parent BRD). Change a scripted number here, in one place.

export const OTP = {
  code: '123456', // parent BR-09
  ttlMs: 10 * 60 * 1000,
  attempts: 3,
} as const

export const LOADER_OPTIONS_MS = [200, 700, 1500] as const
export const DEFAULT_LOADER_MS = 700

export const FUND = {
  mpesaWalletBalance: 500_000, // hidden; above it → "Not enough on M-Pesa" (Fund BR-05)
  inProgressAmount: 25_000, // exactly this → "Top-up in progress" (Fund BR-06)
  mpesaNumberMasked: '+255 75• ••• 412',
  promptRef: 'TZ8K2M1Q',
  merchantName: 'SIMBA BANK', // Fund OQ-2 a)
  mpesaReceipt: 'QJK7HX29PL',
} as const

export const SEND = {
  tipsReference: 'TZ26102611420157', // Figma 42:5300 / 42:5875
  tipsNameAtBank: 'BARAKA JOHN MWAKYUSA', // Send BR-09: any account returns this name
} as const

export const SCAN = {
  merchant: 'Mama Lishe Café',
  initials: 'ML',
  merchantId: '50123456',
  bank: 'CRDB Bank',
  location: 'Dar es Salaam',
  tipsReference: 'TZ26103112054418', // Figma 130:2154
} as const

export const CASH = {
  code: '482 913',
  validMinutes: 30,
  agent: 'Juma Shop',
  agentId: '123456 | UmojaSwitch',
  location: 'Kariakoo, Dar es Salaam',
  reference: 'CW26110312110719',
} as const

export const GOV = {
  controlNumber: '991081123890',
  institution: 'Tanzania Revenue Authority',
  shortName: 'TRA',
  payer: 'Juma Mrisho',
  bill: 'Income tax, Q3 2026',
  payBy: '31.12.2026',
  amount: 200_000,
  receipt: 'EF26120000731',
} as const

export const BILLS = {
  meter: '01234567890',
  owner: 'Juma Mrisho',
  token: '55120398776412094431',
  biller: 'TANESCO LUKU',
} as const
