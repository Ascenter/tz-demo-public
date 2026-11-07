import { useEffect, useRef, useState } from 'react'
import { Icon, type IconName } from '../../components/icons'
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

  const tool = (icon: IconName, label: string, onClick?: () => void, active?: boolean) => (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex flex-col items-center gap-2 text-caption text-white ${onClick ? 'pressable' : ''}`}
    >
      <span className={`grid size-[52px] place-items-center rounded-full ${active ? 'bg-white text-black' : 'bg-white/15 backdrop-blur'}`}>
        <Icon name={icon} color={active ? '#000' : '#fff'} />
      </span>
      {label}
    </button>
  )

  return (
    <div className="absolute inset-0 overflow-hidden bg-black" data-testid="scanner">
      <video ref={video} className="absolute inset-0 size-full object-cover" playsInline muted />
      <div className="absolute inset-x-0 top-0 z-10" style={{ paddingTop: 'var(--safe-top)' }}>
        <div className="flex h-11 items-center px-5">
          <button type="button" data-testid="nav-back" aria-label={t('payments.common.back')} onClick={onBack} className="pressable -ml-2 grid size-10 place-items-center">
            <Icon name="close" color="#fff" />
          </button>
        </div>
        <h1 className="px-5 pt-2 text-center font-display text-header font-semibold text-white">{t('payments.scan_to_pay.scanner_title')}</h1>
      </div>

      {/* viewfinder */}
      <div className="absolute left-1/2 top-[42%] size-[250px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] shadow-[0_0_0_2000px_rgba(0,0,0,0.45)]">
        {['left-0 top-0 border-l-4 border-t-4 rounded-tl-[28px]', 'right-0 top-0 border-r-4 border-t-4 rounded-tr-[28px]', 'left-0 bottom-0 border-l-4 border-b-4 rounded-bl-[28px]', 'right-0 bottom-0 border-r-4 border-b-4 rounded-br-[28px]'].map((c) => (
          <span key={c} className={`absolute size-12 border-white ${c}`} />
        ))}
        {denied && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
            <p className="text-body-m text-white/80">{t('payments.scan_to_pay.camera_denied')}</p>
            <button type="button" data-testid="simulate-scan" onClick={() => fire.current()} className="pressable rounded-full bg-white px-5 py-[10px] text-body-mp font-semibold">
              {t('payments.scan_to_pay.simulate_scan')}
            </button>
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex justify-around px-10" style={{ paddingBottom: 'calc(var(--safe-bottom) + 28px)' }}>
        {tool('gallery', t('payments.scan_to_pay.gallery'))}
        {tool('flashlight', t('payments.scan_to_pay.flashlight'), toggleFlash, flashOn)}
        {tool('qr', t('payments.scan_to_pay.my_qr'))}
      </div>
    </div>
  )
}
