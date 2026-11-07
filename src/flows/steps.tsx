import { useCallback, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'

/**
 * A flow's own back stack. Each entry gets a unique key so screen push/pop animates like iOS.
 * push → slide in from the right; pop/back → slide out to the right.
 */
export function useSteps<S>(initial: S) {
  const seq = useRef(1)
  const [stack, setStack] = useState<{ key: number; step: S }[]>([{ key: 0, step: initial }])
  const [dir, setDir] = useState<1 | -1>(1)

  const push = useCallback((step: S) => {
    setDir(1)
    setStack((s) => [...s, { key: seq.current++, step }])
  }, [])
  const pop = useCallback(() => {
    setDir(-1)
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s))
  }, [])
  /** Go back to the nearest entry matching the predicate (keeps that entry's state). */
  const popTo = useCallback((match: (step: S) => boolean) => {
    setDir(-1)
    setStack((s) => {
      for (let i = s.length - 1; i >= 0; i--) if (match(s[i].step)) return s.slice(0, i + 1)
      return s
    })
  }, [])
  const replace = useCallback((step: S, direction: 1 | -1 = 1) => {
    setDir(direction)
    setStack((s) => [...s.slice(0, -1), { key: seq.current++, step }])
  }, [])

  const top = stack[stack.length - 1]
  return { step: top.step, stepKey: top.key, depth: stack.length, dir, push, pop, popTo, replace }
}

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-28%', zIndex: dir > 0 ? 2 : 0 }),
  center: { x: 0, zIndex: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-28%' : '100%', zIndex: dir > 0 ? 0 : 2 }),
}

/** Animated container for the current step (iOS push/pop slide). */
export function StepHost({ stepKey, dir, children }: { stepKey: number | string; dir: 1 | -1; children: ReactNode }) {
  return (
    <AnimatePresence initial={false} custom={dir}>
      <motion.div
        key={stepKey}
        custom={dir}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ type: 'tween', ease: [0.32, 0.72, 0, 1], duration: 0.38 }}
        className="absolute inset-0 overflow-hidden bg-surface shadow-[-8px_0_24px_rgba(0,0,0,0.06)]"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
