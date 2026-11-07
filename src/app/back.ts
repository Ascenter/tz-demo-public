import { useEffect, useRef } from 'react'
import { nextId, useUi } from './ui'

/**
 * Register this screen's back action. The most recently mounted screen answers both the
 * in-app back icon and the iOS left-edge swipe (our own back stack, per each BRD Navigation table).
 * Pass null to make back do nothing here (e.g. "Check your phone" in Fund my account).
 */
export function useBack(fn: (() => void) | null): void {
  const ref = useRef(fn)
  useEffect(() => {
    ref.current = fn
  })
  useEffect(() => {
    const id = nextId()
    useUi.getState().pushBack(id, () => ref.current?.())
    return () => useUi.getState().removeBack(id)
  }, [])
}

export function goBack(): void {
  const stack = useUi.getState().backStack
  stack[stack.length - 1]?.fn()
}
