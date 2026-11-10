import type { ComponentType, CSSProperties, SVGProps } from 'react'
// Figma icons (copied from the offline export by `npm run design:assets`), inlined as React components by svgr.
// Monochrome ones use currentColor; round 40 pt ones take their circle colour from --icon-bg.
import ArrowLeft24 from '../assets/icons/ic_arrowLeft_24.svg?react'
import ArrowDown16 from '../assets/icons/ic_arrow_down.svg?react'
import ArrowRight16 from '../assets/icons/ic_arrow_right.svg?react'
import Chat20 from '../assets/icons/ic_chat_20.svg?react'
import Checkmark24 from '../assets/icons/ic_checkmark_24.svg?react'
import CrossClose16 from '../assets/icons/ic_cross_close_16.svg?react'
import Diagram24 from '../assets/icons/ic_diagram_24.svg?react'
import Search from '../assets/icons/ic_search.svg?react'
import Search24 from '../assets/icons/ic_search_24.svg?react'
import TabHome from '../assets/icons/tab_home.svg?react'
import TabPayments from '../assets/icons/tab_payments.svg?react'
import TabCredit from '../assets/icons/tab_credit.svg?react'
import TabSavings from '../assets/icons/tab_savings.svg?react'
import TabMore from '../assets/icons/tab_more.svg?react'
import PlusBlack52 from '../assets/icons/plusBlack_52.svg?react'
import ArrowRightBlack52 from '../assets/icons/arrowrightBlack_52.svg?react'
import QrBlack52 from '../assets/icons/qrBlack_52.svg?react'
import CategoryBook from '../assets/icons/category_book.svg?react'
import CategoryCar from '../assets/icons/category_car.svg?react'
import CategoryCommunal from '../assets/icons/category_communal.svg?react'
import CategoryElectricity from '../assets/icons/category_electricity.svg?react'
import CategoryGov from '../assets/icons/category_gov_payments.svg?react'
import CategoryHealth from '../assets/icons/category_health.svg?react'
import CategoryMobileTopUp from '../assets/icons/category_mobile_top_up.svg?react'
import CategoryPercents from '../assets/icons/category_percents.svg?react'
import CategoryProducts from '../assets/icons/category_products.svg?react'
import CategorySendToCard from '../assets/icons/category_send_to_card.svg?react'
import CategoryTopup from '../assets/icons/category_topup.svg?react'
import CategoryTravel from '../assets/icons/category_travel.svg?react'
import CategoryTv from '../assets/icons/category_tv.svg?react'
import CategoryWithdrawCash from '../assets/icons/category_withdraw_cash.svg?react'
import Mobile40 from '../assets/icons/ic_mobile_40.svg?react'
import Wallet40 from '../assets/icons/ic_wallet_40.svg?react'
import UnknownBank40 from '../assets/icons/ic_unknown_bank.svg?react'
import StoreMarket40 from '../assets/icons/ic_store_market_40.svg?react'
import VisaWhite from '../assets/icons/logo_visa_white.svg?react'
import Share24 from '../assets/icons/ic_share_24.svg?react'
import Gallery24 from '../assets/icons/ic_gallery_24.svg?react'
import Flash24 from '../assets/icons/ic_flash_24.svg?react'

type Svg = ComponentType<SVGProps<SVGSVGElement>>

// Glyphs the Figma file has no separate SVG for (keypad delete, copy, 24 pt close…) stay hand-drawn
// on the 24 px grid; they are listed in design/MISSING.md.
const paths = {
  arrowLeft: <path d="M19 12H5m0 0 6-6m-6 6 6 6" />,
  arrowRight: <path d="M5 12h14m0 0-6-6m6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </>
  ),
  diagram: <path d="M5 20V12M10 20V6M15 20v-9M20 20V9" />,
  flash: <path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z" strokeLinejoin="round" />,
  apple: (
    <>
      <path d="M12 8c-1.5-1.3-4.5-1.6-6 .6-1.6 2.4-.6 7.4 2 10 1.3 1.3 2.6 1.1 4 .4 1.4.7 2.7.9 4-.4 2.6-2.6 3.6-7.6 2-10-1.5-2.2-4.5-1.9-6-.6Z" />
      <path d="M12 8c0-2 1-3.5 3-4" />
    </>
  ),
  wallet: (
    <>
      <rect x="4" y="6" width="16" height="13" rx="3" />
      <path d="M16 12.5h.01M4 9.5h16" />
    </>
  ),
  gov: <path d="M4 10h16M12 4l8 4H4l8-4ZM6 10v7m4-7v7m4-7v7m4-7v7M4 20h16" strokeLinejoin="round" />,
  home: <path d="M5 10.5 12 5l7 5.5V19a1 1 0 0 1-1 1h-4v-5h-4v5H6a1 1 0 0 1-1-1v-8.5Z" strokeLinejoin="round" />,
  phone: (
    <>
      <rect x="7" y="3.5" width="10" height="17" rx="2.5" />
      <path d="M11 17.5h2" />
    </>
  ),
  qr: (
    <>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2" />
    </>
  ),
  drop: <path d="M12 4s6 6.4 6 10.5a6 6 0 0 1-12 0C6 10.4 12 4 12 4Z" strokeLinejoin="round" />,
  tv: (
    <>
      <rect x="3.5" y="6" width="17" height="11.5" rx="2" />
      <path d="M9 20.5h6M9 3l3 3 3-3" />
    </>
  ),
  chat: <path d="M5 6.5A1.5 1.5 0 0 1 6.5 5h11A1.5 1.5 0 0 1 19 6.5v8a1.5 1.5 0 0 1-1.5 1.5H10l-4 3v-3h0a1 1 0 0 1-1-1v-8.5Z" />,
  copy: (
    <>
      <rect x="8" y="8" width="11" height="11" rx="2" />
      <path d="M16 5.5A1.5 1.5 0 0 0 14.5 4H6a2 2 0 0 0-2 2v8.5A1.5 1.5 0 0 0 5.5 16" />
    </>
  ),
  flashlight: <path d="M8 3h8v4l-2 3v10a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V10L8 7V3Zm0 4h8M12 13v2" strokeLinejoin="round" />,
  bank: <path d="M4 10h16M12 4l8 4H4l8-4ZM6.5 10v6.5m3.75-6.5v6.5m3.5-6.5v6.5m3.75-6.5v6.5M4 19.5h16" strokeLinejoin="round" />,
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 19.5c1-3.3 3.8-5 7-5s6 1.7 7 5" />
    </>
  ),
  card: (
    <>
      <rect x="3.5" y="6" width="17" height="12" rx="2.5" />
      <path d="M3.5 10h17M7 14.5h3" />
    </>
  ),
  percent: (
    <>
      <path d="M18 6 6 18" />
      <circle cx="7.5" cy="7.5" r="2" />
      <circle cx="16.5" cy="16.5" r="2" />
    </>
  ),
  car: (
    <>
      <path d="M5 16.5V12l1.8-4.2A1.5 1.5 0 0 1 8.2 7h7.6a1.5 1.5 0 0 1 1.4.8L19 12v4.5" />
      <path d="M4 12h16v4.5H4zM6.5 16.5V19M17.5 16.5V19M7.5 14.2h.01M16.5 14.2h.01" />
    </>
  ),
  luggage: (
    <>
      <rect x="6" y="7" width="12" height="13" rx="2.5" />
      <path d="M9.5 7V4.5h5V7M10 11v5M14 11v5" />
    </>
  ),
  book: <path d="M12 6.5C10.5 5.3 8 5 4.5 5v13c3.5 0 6 .3 7.5 1.5m0-13c1.5-1.2 4-1.5 7.5-1.5v13c-3.5 0-6 .3-7.5 1.5m0-13v13" strokeLinejoin="round" />,
  heart: <path d="M12 19s-7-4.4-7-9.5A3.8 3.8 0 0 1 12 7.3a3.8 3.8 0 0 1 7 2.2C19 14.6 12 19 12 19Z" strokeLinejoin="round" />,
  backspace: (
    <>
      <path d="M9 5.5h10a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5H9L3.5 12 9 5.5Z" strokeLinejoin="round" />
      <path d="m11.5 9.5 5 5m0-5-5 5" />
    </>
  ),
} as const

const filled = {
  tabHome: <path d="M3.5 10.6 12 3.5l8.5 7.1V20a1 1 0 0 1-1 1H15v-6.5H9V21H4.5a1 1 0 0 1-1-1v-9.4Z" />,
  tabPayments: (
    <path
      fillRule="evenodd"
      d="M5 4h11.5A2.5 2.5 0 0 1 19 6.5V8h.5A1.5 1.5 0 0 1 21 9.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.5v-12A2.5 2.5 0 0 1 5 4Zm12 8.25a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5ZM5 6.25a.75.75 0 0 0 0 1.5h12V6.5a.25.25 0 0 0-.25-.25H5Z"
    />
  ),
  tabCredit: (
    <>
      <path d="M11 3.05A9 9 0 1 0 20.95 13H11V3.05Z" />
      <path d="M13 2.05V11h8.95A9 9 0 0 0 13 2.05Z" />
    </>
  ),
  tabSavings: (
    <path
      fillRule="evenodd"
      d="M5.5 3h13A2.5 2.5 0 0 1 21 5.5v12a2.5 2.5 0 0 1-2.5 2.5H18v1h-2.5v-1h-7v1H6v-1h-.5A2.5 2.5 0 0 1 3 17.5v-12A2.5 2.5 0 0 1 5.5 3ZM12 7.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 2.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"
    />
  ),
  tabMore: <path d="M3.5 5.5h17v2.25h-17zM3.5 10.875h17v2.25h-17zM3.5 16.25h12v2.25h-12z" />,
  check: <path d="M9.5 16.2 5.3 12l-1.4 1.4 5.6 5.6 11-11-1.4-1.4-9.6 9.6Z" />,
} as const

/** Icons that render the Figma SVG instead of the hand-drawn glyph. */
const FIGMA: Partial<Record<IconName, Svg>> = {
  arrowLeft: ArrowLeft24,
  chevronRight: ArrowRight16,
  chevronDown: ArrowDown16,
  chat: Chat20,
  check: Checkmark24,
  clear: CrossClose16,
  diagram: Diagram24,
  search: Search,
  search24: Search24,
  tabHome: TabHome,
  tabPayments: TabPayments,
  tabCredit: TabCredit,
  tabSavings: TabSavings,
  tabMore: TabMore,
  // From the live file via the Figma MCP (10 Nov 2026): receipt share, scanner gallery and flash.
  share: Share24,
  gallery: Gallery24,
  torch: Flash24,
}

/** Hand-drawn glyphs, Figma-only glyphs, and round-only icons (method rows). */
export type IconName = keyof typeof paths | keyof typeof filled | 'chevronDown' | 'clear' | 'search24' | 'mobile' | 'airtelWallet' | 'torch' | 'share' | 'gallery'

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  size?: number
  color?: string
}

export function Icon({ name, size = 24, color = 'currentColor', style, ...rest }: IconProps) {
  const Figma = FIGMA[name]
  if (Figma) return <Figma width={size} height={size} aria-hidden="true" style={{ color, ...style }} {...rest} />
  const isFilled = name in filled
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={isFilled ? color : 'none'}
      stroke={isFilled ? 'none' : color}
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
      style={style}
      {...rest}
    >
      {isFilled ? filled[name as keyof typeof filled] : paths[name as keyof typeof paths]}
    </svg>
  )
}

/**
 * Round 40 pt icons (Figma "icon / 40 / Category icon" and the method icons). Keys are the app's
 * category names; the circle keeps its Figma colour unless a row overrides it (`color`).
 */
const ROUND: Partial<Record<IconName, Svg>> = {
  arrowRight: CategorySendToCard,
  plus: CategoryTopup,
  wallet: CategoryWithdrawCash,
  card: CategoryWithdrawCash, // ATM row (Figma 176:1053)
  qr: CategoryWithdrawCash, // "Scan QR" row (Figma 1:4211, indigo)
  flash: CategoryElectricity,
  drop: CategoryCommunal,
  home: CategoryCommunal,
  gov: CategoryGov,
  apple: CategoryProducts,
  phone: CategoryMobileTopUp,
  tv: CategoryTv,
  percent: CategoryPercents,
  car: CategoryCar,
  luggage: CategoryTravel,
  book: CategoryBook,
  heart: CategoryHealth,
  mobile: Mobile40,
  airtelWallet: Wallet40,
  bank: UnknownBank40,
  user: StoreMarket40,
}

export type RoundIconName = keyof typeof ROUND

export function hasRoundIcon(name: IconName): boolean {
  return name in ROUND
}

export function RoundIcon({ name, size = 40, color }: { name: IconName; size?: number; color?: string }) {
  const C = ROUND[name]
  if (!C) return null
  return <C width={size} height={size} aria-hidden="true" style={color ? ({ '--icon-bg': color } as CSSProperties) : undefined} />
}

/** 52 pt black round quick action on Home (Figma icon / 52): the glyph is cut out, so the header shows through. */
const QUICK: Partial<Record<IconName, Svg>> = { plus: PlusBlack52, arrowRight: ArrowRightBlack52, qr: QrBlack52 }

export function RoundIcon52({ name }: { name: IconName }) {
  const C = QUICK[name]
  return C ? <C width={52} height={52} aria-hidden="true" className="text-on-bg-primary" /> : null
}

/** White Visa logo for the black card (Figma " payment system logo / visa"). */
export function VisaLogo(props: SVGProps<SVGSVGElement>) {
  return <VisaWhite aria-label="VISA" {...props} />
}
