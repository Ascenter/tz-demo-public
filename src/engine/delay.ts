import { useUi } from '../app/ui'

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

// parent BR-03: every simulated backend answer shows the loader for at least 200 ms.
export const MIN_LOADER_MS = 200

/**
 * Run a scripted "backend" answer behind the loader.
 * The loader stays for max(minMs, presenter setting, 200 ms).
 */
export async function simulate<T>(fn: () => T, opts: { minMs?: number; label?: string } = {}): Promise<T> {
  const ui = useUi.getState()
  const ms = Math.max(MIN_LOADER_MS, opts.minMs ?? ui.loaderMs)
  ui.showLoader(opts.label)
  try {
    await sleep(ms)
    return fn()
  } finally {
    useUi.getState().hideLoader()
  }
}

/**
 * Same timing as simulate() but without the blocking overlay — for answers shown inline while the
 * customer keeps typing (recipient search). The caller shows its own spinner.
 */
export async function simulateInline<T>(fn: () => T): Promise<T> {
  await sleep(Math.max(MIN_LOADER_MS, useUi.getState().loaderMs))
  return fn()
}
