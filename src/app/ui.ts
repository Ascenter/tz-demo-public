import { create } from 'zustand'

// Transient UI state (not persisted): loader, push banner, toast, demo menu, presenter hooks.
interface UiState {
  loaderVisible: boolean
  loaderLabel?: string
  showLoader: (label?: string) => void
  hideLoader: () => void

  push: { id: number; text: string } | null
  showPush: (text: string) => void
  hidePush: () => void

  toast: { id: number; text: string } | null
  showToast: (text: string) => void
  hideToast: () => void

  demoMenuOpen: boolean
  setDemoMenu: (open: boolean) => void

  /** Presenter action the scanner offers (BR-11): set while the scanner is mounted. */
  simulateScan: (() => void) | null
  setSimulateScan: (fn: (() => void) | null) => void

  /** Back handler stack: the top one answers the back icon and the iOS edge swipe. */
  backStack: { id: number; fn: () => void }[]
  pushBack: (id: number, fn: () => void) => void
  removeBack: (id: number) => void

  loaderMs: number
}

let seq = 1

export const useUi = create<UiState>((set) => ({
  loaderVisible: false,
  showLoader: (label) => set({ loaderVisible: true, loaderLabel: label }),
  hideLoader: () => set({ loaderVisible: false, loaderLabel: undefined }),

  push: null,
  showPush: (text) => set({ push: { id: seq++, text } }),
  hidePush: () => set({ push: null }),

  toast: null,
  showToast: (text) => set({ toast: { id: seq++, text } }),
  hideToast: () => set({ toast: null }),

  demoMenuOpen: false,
  setDemoMenu: (open) => set({ demoMenuOpen: open }),

  simulateScan: null,
  setSimulateScan: (fn) => set({ simulateScan: fn }),

  backStack: [],
  pushBack: (id, fn) => set((s) => ({ backStack: [...s.backStack.filter((b) => b.id !== id), { id, fn }] })),
  removeBack: (id) => set((s) => ({ backStack: s.backStack.filter((b) => b.id !== id) })),

  loaderMs: 700, // mirrored from the persisted store on change
}))

export function nextId(): number {
  return seq++
}
