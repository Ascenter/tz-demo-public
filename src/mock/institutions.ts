import type { IconName } from '../components/icons'

// GePG institutions (Gov BR-02). Only TRA tax opens the flow. Titles live in texts.ts; icon/colour from Figma 239:4123.
export interface Institution {
  id: string
  active: boolean
  icon: IconName
  color: string
}

export const INSTITUTIONS: Institution[] = [
  { id: 'tra', active: true, icon: 'percent', color: '#ff6b6b' },
  { id: 'police', active: false, icon: 'car', color: '#d0646e' },
  { id: 'immigration', active: false, icon: 'luggage', color: '#39cc7e' },
  { id: 'heslb', active: false, icon: 'book', color: '#ff9d57' },
  { id: 'local', active: false, icon: 'gov', color: '#39cc7e' },
  { id: 'land', active: false, icon: 'home', color: '#4bc5eb' },
  { id: 'hospital', active: false, icon: 'heart', color: '#ff6fcf' },
  { id: 'parking', active: false, icon: 'car', color: '#d0646e' },
]

export const TRA = INSTITUTIONS[0]
