import { useRef } from 'react'
import { useUi } from './ui'
import StatusBarSvg from '../assets/icons/statusbar.svg?react'

/**
 * Status bar area. In the device frame it draws the Figma iOS status bar (9:41, signal, Wi-Fi, battery);
 * on the iPhone the real one shows through. A triple tap here opens the hidden demo menu.
 */
export function StatusBar({ fake }: { fake: boolean }) {
  const taps = useRef<number[]>([])
  const onTap = () => {
    const t = performance.now()
    taps.current = [...taps.current.filter((x) => t - x < 600), t]
    if (taps.current.length >= 3) {
      taps.current = []
      useUi.getState().setDemoMenu(true)
    }
  }
  return (
    <div
      data-testid="status-bar"
      onClick={onTap}
      className="absolute inset-x-0 top-0 z-[60]"
      style={{ height: 'var(--safe-top)' }}
    >
      {fake && (
        // Figma status bar (402 × 44, black glyphs). Split at the middle so on a wider device the time
        // stays left and the indicators stay right; it sits at the bottom of the device's top inset.
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-11 justify-between text-on-bg-primary">
          <StatusBarSvg width={201} height={44} viewBox="0 0 201 44" aria-hidden="true" />
          <StatusBarSvg width={201} height={44} viewBox="201 0 201 44" aria-hidden="true" />
        </div>
      )}
    </div>
  )
}
