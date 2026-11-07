// Airtime: operator by number prefix (Airtime field mapping).
export const OPERATOR_PREFIXES: Record<string, string[]> = {
  Vodacom: ['074', '075', '076'],
  Airtel: ['068', '069', '078'],
  Yas: ['065', '067', '071', '077'],
  Halotel: ['061', '062'],
  TTCL: ['073'],
}

/** Badge colour per operator. */
export const OPERATOR_COLORS: Record<string, string> = {
  Vodacom: '#e60000',
  Airtel: '#d6001c',
  Yas: '#0a3d91',
  Halotel: '#f28c00',
  TTCL: '#00843d',
}
