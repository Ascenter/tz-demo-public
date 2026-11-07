import type { Ledger, Operation } from '../engine/money'

// parent BR-04 / BR-15: main seed customer.
export const CUSTOMER = {
  name: 'Daudi Massawe',
  phone: '+255 784 123 456',
  phoneMasked: '+255 78• ••• 456', // OTP target, shown masked (parent BR-09)
  accountMasked: '•••• 7788',
  bank: 'Mo-Simba',
} as const

export const SEED_LEDGER: Ledger = {
  ownFunds: 250_000,
  creditLimit: 660_000,
  creditUsed: 0,
}

// parent BR-17: seed history, dated relative to device time. Already included in own funds.
export const SEED_HISTORY: Operation[] = [
  { id: 'seed-1', title: 'Water', subtitle: 'Bills · DAWASA', amount: 20_000, direction: 'out', category: 'water', at: 0, dayOffset: 0 },
  { id: 'seed-2', title: 'Juma Mrisho', subtitle: 'To M-Pesa wallet', amount: 35_000, direction: 'out', category: 'transfer', at: 0, dayOffset: 0 },
  { id: 'seed-3', title: 'Shoppers Supermarket', subtitle: 'Card payment', amount: 48_500, direction: 'out', category: 'card', at: 0, dayOffset: 0 },
  { id: 'seed-4', title: 'Cash withdrawal', subtitle: 'ATM, Mlimani City', amount: 100_000, direction: 'out', category: 'cash', at: 0, dayOffset: 1 },
  { id: 'seed-5', title: 'Top up from Airtel Money', subtitle: 'Top up', amount: 150_000, direction: 'in', category: 'topup', at: 0, dayOffset: 1 },
  { id: 'seed-6', title: 'TRA tax', subtitle: 'Government payment', amount: 45_000, direction: 'out', category: 'gov', at: 0, dayOffset: 1 },
]
