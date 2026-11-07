import { useCallback, useRef } from 'react'

/**
 * Idempotent confirm (parent error table "Repeated tap"): the first tap runs the action,
 * later taps are ignored until reset() — double taps create one operation.
 */
export function useOnce() {
  const locked = useRef(false)
  const run = useCallback((fn: () => void | Promise<void>) => {
    if (locked.current) return
    locked.current = true
    void fn()
  }, [])
  const reset = useCallback(() => {
    locked.current = false
  }, [])
  return { run, reset }
}
