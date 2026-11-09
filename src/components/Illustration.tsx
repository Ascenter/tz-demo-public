// Figma mascot illustrations (lion), copied from the offline export by `npm run design:assets`.
// Each is shipped as @3x WebP with a PNG fallback and drawn at its Figma pt size.
import positiveWebp from '../assets/illustrations/positive@3x.webp'
import positivePng from '../assets/illustrations/positive@3x.png'
import phoneWebp from '../assets/illustrations/art_card_pay_phone@3x.webp'
import phonePng from '../assets/illustrations/art_card_pay_phone@3x.png'
import sadWebp from '../assets/illustrations/leo_sad@3x.webp'
import sadPng from '../assets/illustrations/leo_sad@3x.png'
import clocksWebp from '../assets/illustrations/dali_clocks@3x.webp'
import clocksPng from '../assets/illustrations/dali_clocks@3x.png'
import receiptWebp from '../assets/illustrations/wolverine_logan@3x.webp'
import receiptPng from '../assets/illustrations/wolverine_logan@3x.png'
import cashWebp from '../assets/illustrations/send_money@3x.webp'
import cashPng from '../assets/illustrations/send_money@3x.png'
import notFoundWebp from '../assets/illustrations/main_pose@3x.webp'
import notFoundPng from '../assets/illustrations/main_pose@3x.png'

export type IllustrationKind = 'success' | 'phone' | 'error' | 'pending' | 'receipt' | 'cash' | 'notFound'

/** Which picture goes where, and its size in pt (Figma). */
const ART: Record<IllustrationKind, { webp: string; png: string; w: number; h: number }> = {
  success: { webp: positiveWebp, png: positivePng, w: 295, h: 196 }, // Fund success
  phone: { webp: phoneWebp, png: phonePng, w: 295, h: 196 }, // M-Pesa "Check your phone"
  error: { webp: sadWebp, png: sadPng, w: 295, h: 196 }, // declined, not enough on M-Pesa
  pending: { webp: clocksWebp, png: clocksPng, w: 295, h: 196 }, // in progress
  receipt: { webp: receiptWebp, png: receiptPng, w: 240, h: 160 }, // every receipt
  cash: { webp: cashWebp, png: cashPng, w: 322, h: 196 }, // cash code
  notFound: { webp: notFoundWebp, png: notFoundPng, w: 120, h: 80 }, // airtime "Number not found"
}

export function Illustration({ kind }: { kind: IllustrationKind }) {
  const a = ART[kind]
  return (
    <picture data-testid={`illustration-${kind}`} className="block shrink-0" style={{ width: a.w, height: a.h }}>
      <source srcSet={a.webp} type="image/webp" />
      <img src={a.png} alt="" width={a.w} height={a.h} draggable={false} className="block size-full mix-blend-multiply" />
    </picture>
  )
}
