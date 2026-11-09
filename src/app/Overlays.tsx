import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useUi } from './ui'
import { t } from '../mock/texts'
import { PawLoader } from '../components/Loader'

/** Blocking loader for every simulated backend answer (parent BR-03). */
export function LoaderOverlay() {
  const { loaderVisible, loaderLabel } = useUi()
  return (
    <AnimatePresence>
      {loaderVisible && (
        <motion.div
          data-testid="loader"
          className={`absolute inset-0 z-[70] grid place-items-center ${loaderLabel ? '' : 'bg-white/40'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        >
          <div className="flex flex-col items-center gap-2">
            <PawLoader />
            {/* A labelled wait (QR check) shows its label in the screen's own title (Scanner). */}
            <span className="sr-only">{loaderLabel ?? t('payments.common.loading')}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Simulated iOS push banner (parent BR-12): slides from the top, hides after 4 s, tap to dismiss. */
export function PushBanner() {
  const { push, hidePush } = useUi()
  useEffect(() => {
    if (!push) return
    const id = setTimeout(hidePush, 4000)
    return () => clearTimeout(id)
  }, [push, hidePush])
  return (
    <AnimatePresence>
      {push && (
        <motion.button
          key={push.id}
          type="button"
          data-testid="push-banner"
          onClick={hidePush}
          className="absolute inset-x-2 z-[80] flex items-center gap-3 rounded-[24px] bg-white/80 px-[14px] py-3 text-left shadow-[0_10px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl backdrop-saturate-150"
          style={{ top: 'calc(var(--safe-top) + 4px)' }}
          initial={{ y: -140, opacity: 0.6 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -140, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          onDragEnd={(_, info) => info.offset.y < -20 && hidePush()}
        >
          <AppIcon size={38} />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="flex items-center justify-between">
              <span className="t-semibold-15">{t('app.name')}</span>
              <span className="t-regular-13 text-on-bg-secondary">{t('app.now')}</span>
            </span>
            <span data-testid="push-text" className="t-regular-15 leading-5">
              {push.text}
            </span>
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

export function AppIcon({ size = 38 }: { size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center font-display font-bold text-black"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.24,
        background: 'linear-gradient(180deg,#feffd6,#ffc3ad)',
        fontSize: size * 0.42,
      }}
    >
      M
    </span>
  )
}

/** Toaster (Figma "toaster"): short black pill above the bottom edge. */
export function Toast() {
  const { toast, hideToast } = useUi()
  useEffect(() => {
    if (!toast) return
    const id = setTimeout(hideToast, 2600)
    return () => clearTimeout(id)
  }, [toast, hideToast])
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          data-testid="toast"
          role="status"
          className="pointer-events-none absolute inset-x-5 z-[75] flex justify-center"
          style={{ top: 'calc(var(--safe-top) + 8px)' }}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
        >
          <span className="rounded-full bg-black/85 px-4 py-[6px] text-center t-regular-14 text-white">{toast.text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
