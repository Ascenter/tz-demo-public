// Send money directory and Airtime recipients (Send and Airtime BRD field mapping).

export interface SendRecipient {
  /** Full account number, digits only — the identity of a recipient (one row per account). */
  account: string
  name: string
  phone?: string
  bank: string
  kind: 'internal' | 'tips'
}

export const MO_SIMBA = 'Mo-Simba'

/** Scripted "NEW RECIPIENT" found by phone or account (Send S1). */
export const BARAKA_INTERNAL: SendRecipient = {
  account: '015023456789',
  name: 'Baraka M.',
  phone: '+255 784 552 019',
  bank: MO_SIMBA,
  kind: 'internal',
}

/** Search inputs (digits only) that find Baraka M. */
export const BARAKA_LOOKUP_KEYS = ['0784552019', '255784552019', '784552019', '015023456789']

// Seed Recent: Neema Mushi (saved), Joseph Kimaro, Amina Said.
// Assumption: account numbers for seed recipients are not in the BRD (see ASSUMPTIONS.md).
export const SEED_RECENT: SendRecipient[] = [
  { account: '015011223344', name: 'Neema Mushi', phone: '+255 754 318 902', bank: MO_SIMBA, kind: 'internal' },
  { account: '015055667788', name: 'Joseph Kimaro', phone: '+255 683 220 415', bank: MO_SIMBA, kind: 'internal' },
  { account: '015099001122', name: 'Amina Said', phone: '+255 715 609 118', bank: MO_SIMBA, kind: 'internal' },
]

/** Saved contacts at seed: account → contact name. */
export const SEED_SAVED: Record<string, string> = {
  '015011223344': 'Neema Mushi',
}

// Airtime recipient screen (Airtime BR-02).
export interface AirtimeContact {
  name: string
  phone: string // +255 XXX XXX XXX
}

export const AIRTIME_MY_NUMBER: AirtimeContact = { name: 'My number', phone: '+255 784 123 456' }

export const AIRTIME_RECENT: AirtimeContact[] = [
  { name: 'Neema Mushi', phone: '+255 754 318 902' },
  { name: 'Joseph Kimaro', phone: '+255 683 220 415' },
  { name: 'Amina Said', phone: '+255 715 609 118' },
]

export const AIRTIME_CONTACTS: AirtimeContact[] = [
  { name: 'Athumani Bakari', phone: '+255 768 220 415' },
  { name: 'Asha Mwinyi', phone: '+255 655 903 118' },
  { name: 'Bahati Mollel', phone: '+255 742 610 093' },
]
