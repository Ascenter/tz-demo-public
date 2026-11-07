// One place for "now", so tests can pin the clock.
let override: (() => number) | null = null

export function now(): number {
  return override ? override() : Date.now()
}

export function setClock(fn: (() => number) | null): void {
  override = fn
}

export function startOfDay(ms: number): number {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export const DAY_MS = 24 * 60 * 60 * 1000
