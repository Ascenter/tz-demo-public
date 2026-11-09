import { useEffect, useRef, useState } from 'react'
import { Icon } from '../../components/icons'
import { useBack } from '../../app/back'
import { useUi } from '../../app/ui'
import { t } from '../../mock/texts'

type QrScannerT = import('qr-scanner').default

/**
 * Full-screen camera scanner "Scan the QR to pay". qr-scanner is lazy-loaded.
 * Any decoded QR counts (Scan BR-02). Fallbacks so the demo never blocks: the demo menu
 * "Simulate QR scan" and, when the camera is unavailable, a "Simulate scan" button here.
 */
export function Scanner({ onBack, onScanned }: { onBack: () => void; onScanned: () => void }) {
  useBack(onBack)
  const video = useRef<HTMLVideoElement>(null)
  const scanner = useRef<QrScannerT | null>(null)
  const fired = useRef(false)
  const [denied, setDenied] = useState(false)
  const [hasFlash, setHasFlash] = useState(false)
  const [flashOn, setFlashOn] = useState(false)

  const fire = useRef(() => {})
  fire.current = () => {
    if (fired.current) return
    fired.current = true
    scanner.current?.stop()
    onScanned()
  }

  useEffect(() => {
    const trigger = () => fire.current()
    useUi.getState().setSimulateScan(trigger)
    return () => {
      if (useUi.getState().simulateScan === trigger) useUi.getState().setSimulateScan(null)
    }
  }, [])

  useEffect(() => {
    let disposed = false
    ;(async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia || !video.current) throw new Error('no camera')
        const { default: QrScanner } = await import('qr-scanner')
        if (disposed || !video.current) return
        const s = new QrScanner(video.current, () => fire.current(), {
          preferredCamera: 'environment',
          returnDetailedScanResult: true,
          maxScansPerSecond: 8,
        })
        scanner.current = s
        await s.start()
        if (disposed) return s.destroy()
        setHasFlash(await s.hasFlash().catch(() => false))
      } catch {
        if (!disposed) setDenied(true)
      }
    })()
    return () => {
      disposed = true
      scanner.current?.destroy()
      scanner.current = null
    }
  }, [])

  const toggleFlash = async () => {
    if (!scanner.current || !hasFlash) return // no-op where the browser has no torch
    await scanner.current.toggleFlash().catch(() => undefined)
    setFlashOn(scanner.current.isFlashOn())
  }

  // Zoom presets as drawn (Figma 130:901). The demo camera keeps its own zoom; the selection is visual.
  const [zoom, setZoom] = useState(1)
  const loaderLabel = useUi((s) => (s.loaderVisible ? s.loaderLabel : undefined))

  return (
    <div className="absolute inset-0 overflow-hidden bg-black" data-testid="scanner">
      <video ref={video} className="absolute inset-0 size-full object-cover" playsInline muted />

      {/* Top bar (0–148 pt): back, flash, title. While the merchant is checked the title says so (Figma 130:1092). */}
      <div className="absolute inset-x-0 top-0 z-10 h-[148px] bg-black/40" style={{ paddingTop: 'var(--safe-top)' }}>
        <div className="flex h-11 items-center justify-between px-5">
          <button type="button" data-testid="nav-back" aria-label={t('payments.common.back')} onClick={onBack} className="pressable -ml-2 grid size-10 place-items-center">
            <Icon name="arrowLeft" color="var(--color-surface)" />
          </button>
          <button
            type="button"
            aria-label={t('payments.scan_to_pay.flashlight')}
            aria-pressed={flashOn}
            onClick={toggleFlash}
            className="pressable -mr-2 grid size-10 place-items-center"
          >
            <Icon name="flash" color="var(--color-surface)" style={{ opacity: hasFlash || flashOn ? 1 : 0.9 }} />
          </button>
        </div>
        <h1 className="px-5 pt-2 text-center t-display-20 text-white">{loaderLabel ?? t('payments.scan_to_pay.scanner_title')}</h1>
      </div>

      {denied && (
        // No camera (desktop rehearsal, denied permission): the presenter can still scan.
        <div className="absolute inset-x-0 top-[148px] bottom-[180px] flex flex-col items-center justify-center gap-3 text-center">
          <p className="t-regular-14 text-white/80">{t('payments.scan_to_pay.camera_denied')}</p>
          <button type="button" data-testid="simulate-scan" onClick={() => fire.current()} className="pressable rounded-full bg-white px-5 py-[10px] t-semibold-15">
            {t('payments.scan_to_pay.simulate_scan')}
          </button>
        </div>
      )}

      {/* Bottom bar (694–874 pt on 402 × 874): zoom presets, gallery. */}
      <div className="absolute inset-x-0 bottom-0 z-10 h-[180px] bg-black/40">
        <div className="mt-[24px] flex justify-center gap-[18px]">
          {[1, 2, 3].map((z) => (
            <button
              key={z}
              type="button"
              aria-pressed={zoom === z}
              onClick={() => setZoom(z)}
              className={`grid size-[34px] place-items-center rounded-full t-semibold-13 ${zoom === z ? 'bg-white/20 text-white' : 'text-white/60'}`}
            >
              {z}x
            </button>
          ))}
        </div>
        <span
          aria-label={t('payments.scan_to_pay.gallery')}
          className="absolute right-5 grid size-10 place-items-center rounded-full bg-white/20"
          style={{ bottom: 'calc(var(--safe-bottom) + 10px)' }}
        >
          <Icon name="gallery" size={22} color="var(--color-surface)" />
        </span>
      </div>
    </div>
  )
}
