import { createPortal } from 'react-dom'
import { AnimatePresence, motion, type PanInfo } from 'motion/react'
import type { ReactNode } from 'react'
import { useBack } from '../app/back'

interface Props {
  open: boolean
  /** Swipe down, backdrop tap and back gesture call this; omit to make the sheet modal. */
  onDismiss?: () => void
  children: ReactNode
  testId?: string
}

function overlayRoot(): HTMLElement {
  return document.getElementById('overlay-root') ?? document.body
}

/** iOS-like bottom sheet: dimmed backdrop, spring in, drag down to dismiss (Figma "FFModalDetails"). */
export function BottomSheet({ open, onDismiss, children, testId }: Props) {
  return createPortal(
    <AnimatePresence>{open && <SheetBody onDismiss={onDismiss} testId={testId}>{children}</SheetBody>}</AnimatePresence>,
    overlayRoot(),
  )
}

function SheetBody({ onDismiss, children, testId }: Omit<Props, 'open'>) {
  useBack(onDismiss ?? null)
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (onDismiss && (info.offset.y > 120 || info.velocity.y > 600)) onDismiss()
  }
  return (
    <div className="absolute inset-0 z-40">
      <motion.div
        className="absolute inset-0 bg-modal-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onDismiss}
      />
      <motion.div
        role="dialog"
        data-testid={testId}
        className="absolute inset-x-2 flex flex-col gap-6 rounded-container bg-surface px-5 pb-5 pt-8"
        style={{ bottom: 'calc(var(--safe-bottom) + 8px)' }}
        initial={{ y: '110%' }}
        animate={{ y: 0 }}
        exit={{ y: '110%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 380 }}
        drag={onDismiss ? 'y' : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={onDragEnd}
      >
        <div className="absolute left-1/2 top-2 h-[5px] w-9 -translate-x-1/2 rounded-full bg-black/15" />
        {children}
      </motion.div>
    </div>
  )
}

/** Sheet title + subtitle. */
export function SheetTitle({ title, subtitle }: { title: ReactNode; subtitle?: ReactNode }) {
  return (
    <div className="flex flex-col gap-[2px]">
      <h2 className="font-display text-header font-semibold">{title}</h2>
      {subtitle && <p className="text-body-m text-secondary">{subtitle}</p>}
    </div>
  )
}

/** Label 14 + value 16 rows (Figma "text-pair 14+16"). Rows with an empty value are hidden. */
export function DetailRows({ rows }: { rows: [string, ReactNode | undefined][] }) {
  return (
    <div className="flex flex-col gap-4">
      {rows
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([label, value]) => (
          <div key={label} className="flex flex-col">
            <span className="text-body-m text-secondary">{label}</span>
            <span className="text-body-l text-primary">{value}</span>
          </div>
        ))}
    </div>
  )
}
