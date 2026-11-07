import { useRef } from 'react'
import { useUi } from './ui'

/**
 * Status bar area. In the device frame it draws a fake iOS status bar (9:41, signal, Wi-Fi, battery);
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
        <div className="pointer-events-none relative h-full text-primary">
          <span className="absolute left-10 top-1/2 -translate-y-1/2 text-[15px] font-semibold tracking-[-0.23px]">9:41</span>
          <span className="absolute right-[40px] top-1/2 flex -translate-y-1/2 items-center gap-[5px]">
            <svg width="17" height="11" viewBox="0 0 17 11" aria-hidden="true">
              <rect x="0" y="7" width="3" height="4" rx="0.7" fill="currentColor" />
              <rect x="4.5" y="5" width="3" height="6" rx="0.7" fill="currentColor" />
              <rect x="9" y="2.5" width="3" height="8.5" rx="0.7" fill="currentColor" />
              <rect x="13.5" y="0" width="3" height="11" rx="0.7" fill="currentColor" />
            </svg>
            <svg width="15" height="11" viewBox="0 0 15 11" aria-hidden="true">
              <path d="M7.5 2.2c2.1 0 4 .8 5.5 2.1l1-1A9.2 9.2 0 0 0 7.5.8 9.2 9.2 0 0 0 1 3.3l1 1a7.8 7.8 0 0 1 5.5-2.1Z" fill="currentColor" />
              <path d="M7.5 5.1c1.3 0 2.5.5 3.4 1.3l1-1a6.2 6.2 0 0 0-8.8 0l1 1c.9-.8 2.1-1.3 3.4-1.3Z" fill="currentColor" />
              <path d="M9.3 8.3 7.5 10.2 5.7 8.3a2.6 2.6 0 0 1 3.6 0Z" fill="currentColor" />
            </svg>
            <span className="relative ml-[2px] h-[11.3px] w-[24px]">
              <span className="absolute inset-y-0 left-0 w-[22px] rounded-[2.7px] border border-current opacity-35" />
              <span className="absolute left-[2px] top-[2px] h-[7.3px] w-[18px] rounded-[1.3px] bg-current" />
              <span className="absolute right-0 top-1/2 h-1 w-[1.3px] -translate-y-1/2 rounded-r bg-current opacity-40" />
            </span>
          </span>
        </div>
      )}
    </div>
  )
}
