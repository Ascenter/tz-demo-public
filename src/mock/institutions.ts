// GePG institutions (Gov BR-02). Only TRA tax opens the flow. Titles live in texts.ts.
export interface Institution {
  id: string
  active: boolean
}

export const INSTITUTIONS: Institution[] = [
  { id: 'tra', active: true },
  { id: 'police', active: false },
  { id: 'immigration', active: false },
  { id: 'heslb', active: false },
  { id: 'local', active: false },
  { id: 'land', active: false },
  { id: 'hospital', active: false },
  { id: 'parking', active: false },
]
