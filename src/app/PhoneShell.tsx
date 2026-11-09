import { useRef, type ReactNode } from 'react'
import { StatusBar } from './StatusBar'
import { LoaderOverlay, PushBanner, Toast } from './Overlays'
import { DemoMenu } from './DemoMenu'
import { goBack } from './back'
import { useDemo } from './store'
import { IS_FULLSCREEN } from './bootReset'
import { BARE, DEVICE } from './device'

/**
 * Desktop: a centred iPhone 15 Plus frame (430 × 932, see device.ts) with a fake status bar (rehearsal, backup screen share).
 * `?bare=1`: the screen alone at the device size, for screenshots and design:check.
 * iPhone (installed PWA or phone browser): full screen, real safe areas, no frame.
 */
export function PhoneShell({ children }: { children: ReactNode }) {
  const showFrame = useDemo((s) => s.showFrame)
  const touch = useRef<{ x: number; y: number } | null>(null)

  // iOS edge swipe → our back stack (the same action as the in-app back icon).
  const onTouchStart = (e: React.TouchEvent) => {
    const p = e.touches[0]
    const left = (e.currentTarget as HTMLElement).getBoundingClientRect().left
    touch.current = p.clientX - left < 24 ? { x: p.clientX, y: p.clientY } : null
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current
    touch.current = null
    if (!start) return
    const p = e.changedTouches[0]
    const dx = p.clientX - start.x
    if (dx > 70 && Math.abs(p.clientY - start.y) < dx) goBack()
  }

  const screen = (
    <div
      id="phone-screen"
      className="app-chrome relative h-full w-full overflow-hidden bg-surface"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {children}
      <div id="overlay-root" className="pointer-events-none absolute inset-0 z-40 [&>*]:pointer-events-auto" />
      <LoaderOverlay />
      <Toast />
      <PushBanner />
      <StatusBar fake={!IS_FULLSCREEN} />
      <DemoMenu />
    </div>
  )

  if (IS_FULLSCREEN) return <div className="app-fullscreen">{screen}</div>

  const size = { width: DEVICE.width, height: DEVICE.height }
  const insets = { '--safe-top': `${DEVICE.safeTop}px`, '--safe-bottom': `${DEVICE.safeBottom}px` } as React.CSSProperties
  if (BARE) {
    return (
      <div className="relative overflow-hidden" style={{ ...size, ...insets }}>
        {screen}
      </div>
    )
  }

  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <div
        className={showFrame ? 'rounded-[68px] bg-[#111] p-[12px] shadow-[0_30px_80px_rgba(0,0,0,0.35)]' : ''}
        style={{ width: DEVICE.width + (showFrame ? 24 : 0), ...insets }}
      >
        <div
          className={`relative overflow-hidden ${showFrame ? 'rounded-[56px]' : ''}`}
          style={size}
        >
          {screen}
          {showFrame && (
            <div className="pointer-events-none absolute left-1/2 top-[11px] z-[100] h-[37px] w-[126px] -translate-x-1/2 rounded-full bg-black" />
          )}
        </div>
      </div>
    </div>
  )
}
