import type { IconName } from '../components/icons'

// Bill payments biller list (Bills BR-02). Only LUKU electricity opens; the rest show "Soon".
export interface Biller {
  id: string
  titleKey: string
  subtitleKey: string
  icon: IconName
  color: string
  active: boolean
}

export const BILLERS: Biller[] = [
  { id: 'luku', titleKey: 'payments.bills.luku', subtitleKey: 'payments.bills.luku_subtitle', icon: 'flash', color: '#7a80ff', active: true },
  { id: 'tv', titleKey: 'payments.bills.tv', subtitleKey: 'payments.bills.tv_subtitle', icon: 'tv', color: '#ff7a8a', active: false },
  { id: 'gepg', titleKey: 'payments.bills.gepg', subtitleKey: 'payments.bills.gepg_subtitle', icon: 'gov', color: '#39cc7e', active: false },
  { id: 'water', titleKey: 'payments.bills.water', subtitleKey: 'payments.bills.water_subtitle', icon: 'drop', color: '#ff7a8a', active: false },
]

/** Saved meter in the SAVED block (seed). */
export const SAVED_METER = { owner: 'Juma Mrisho', meter: '01234567890', color: '#a983fb' } as const
