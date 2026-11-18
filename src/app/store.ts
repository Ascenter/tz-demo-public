import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { available, credit, debit, type Ledger, type Operation } from '../engine/money'
import { now } from '../engine/clock'
import { SEED_HISTORY, SEED_LEDGER } from '../mock/seed'
import {
  AIRTIME_CONTACTS,
  AIRTIME_RECENT,
  AIRTIME_RECENT_MAX,
  SEED_RECENT,
  SEED_SAVED,
  type AirtimeContact,
  type SendRecipient,
} from '../mock/recipients'
import { DEFAULT_LOADER_MS } from '../mock/scripted'
import { MASTER_SCRIPT } from '../mock/masterScript'
import { airtimeOp, type OpDraft } from '../mock/operations'
import { useUi } from './ui'

// parent BR-08: one ledger, one store — balance, feed and history update together.
export { STORE_KEY_RAW as STORE_KEY } from './storeKey'
import { STORE_KEY_RAW as STORE_KEY } from './storeKey'
export const STORE_VERSION = 1

interface Data {
  ledger: Ledger
  history: Operation[]
  recent: SendRecipient[]
  saved: Record<string, string>
  /** Airtime recipient screen: Recent (3 latest) and Contacts, scripted at seed (Airtime BR-02, BR-15). */
  airtimeRecent: AirtimeContact[]
  airtimeContacts: AirtimeContact[]
}

interface DemoState extends Data {
  loaderMs: number
  showFrame: boolean
  /** Money going out: own funds first, then credit (parent BR-06). */
  spend: (draft: OpDraft) => void
  /** Money coming in. */
  receive: (draft: OpDraft) => void
  /** Send money: put a recipient on top of Recent, one row per account (Send BR-08). */
  useRecipient: (r: SendRecipient) => void
  /** Send money: save or rename a contact, one entry per account (Send BR-07). */
  saveContact: (account: string, name: string, phone?: string) => void
  /** Airtime: save a typed number as a contact in the app's data only (Airtime BR-15, BR-16). */
  saveAirtimeContact: (c: AirtimeContact) => void
  resetToSeed: () => void
  jumpToStep: (n: number) => void
  setLoaderMs: (ms: number) => void
  setShowFrame: (v: boolean) => void
}

let opSeq = 0
const makeOp = (d: OpDraft): Operation => ({ ...d, id: `op-${now()}-${opSeq++}`, at: now() })

function seedData(): Data {
  return {
    ledger: { ...SEED_LEDGER },
    history: SEED_HISTORY.map((o) => ({ ...o })),
    recent: SEED_RECENT.map((r) => ({ ...r })),
    saved: { ...SEED_SAVED },
    airtimeRecent: AIRTIME_RECENT.map((c) => ({ ...c })),
    airtimeContacts: AIRTIME_CONTACTS.map((c) => ({ ...c })),
  }
}

function applySpend(d: Data, draft: OpDraft): Data {
  return { ...d, ledger: debit(d.ledger, draft.amount), history: [makeOp(draft), ...d.history] }
}
function applyReceive(d: Data, draft: OpDraft): Data {
  return { ...d, ledger: credit(d.ledger, draft.amount), history: [makeOp(draft), ...d.history] }
}
function applyRecipient(d: Data, r: SendRecipient): Data {
  return { ...d, recent: [r, ...d.recent.filter((x) => x.account !== r.account)] }
}

/**
 * Airtime BR-15: the saved number goes first in Recent (3 latest) and into Contacts (by name), and the feed
 * entries of that number show the name from now on.
 */
function applyAirtimeSave(d: Data, c: AirtimeContact): Data {
  const named = airtimeOp(c.name, '', 0)
  return {
    ...d,
    airtimeRecent: [c, ...d.airtimeRecent.filter((x) => x.phone !== c.phone)].slice(0, AIRTIME_RECENT_MAX),
    airtimeContacts: [...d.airtimeContacts.filter((x) => x.phone !== c.phone), c].sort((a, b) => a.name.localeCompare(b.name)),
    history: d.history.map((o) => (o.category === 'airtime' && o.title === c.phone ? { ...o, title: c.name, initials: named.initials } : o)),
  }
}

/** State after step N of the Master demo script (seed + every op of steps 1..N, in order). */
export function dataAfterStep(n: number): Data {
  let d = seedData()
  for (const step of MASTER_SCRIPT.slice(1, n + 1)) {
    for (const op of step.ops) d = op.direction === 'in' ? applyReceive(d, op) : applySpend(d, op)
    for (const r of step.recipients ?? []) d = applyRecipient(d, r)
    d = { ...d, saved: { ...d.saved, ...step.saved } }
    for (const c of step.airtimeSaved ?? []) d = applyAirtimeSave(d, c)
  }
  return d
}

export const useDemo = create<DemoState>()(
  persist(
    (set) => ({
      ...seedData(),
      loaderMs: DEFAULT_LOADER_MS,
      showFrame: true,
      spend: (draft) => set((s) => applySpend(s, draft)),
      receive: (draft) => set((s) => applyReceive(s, draft)),
      useRecipient: (r) => set((s) => applyRecipient(s, r)),
      saveContact: (account, name, phone) =>
        set((s) => ({
          saved: { ...s.saved, [account]: name },
          recent: s.recent.map((r) => (r.account === account && phone ? { ...r, phone } : r)),
        })),
      saveAirtimeContact: (c) => set((s) => applyAirtimeSave(s, c)),
      resetToSeed: () => set(seedData()),
      jumpToStep: (n) => set(dataAfterStep(n)),
      setLoaderMs: (ms) => {
        useUi.setState({ loaderMs: ms })
        set({ loaderMs: ms })
      },
      setShowFrame: (v) => set({ showFrame: v }),
    }),
    {
      name: STORE_KEY,
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        ledger: s.ledger,
        history: s.history,
        recent: s.recent,
        saved: s.saved,
        airtimeRecent: s.airtimeRecent,
        airtimeContacts: s.airtimeContacts,
        loaderMs: s.loaderMs,
        showFrame: s.showFrame,
      }),
      onRehydrateStorage: () => (s) => {
        if (s) useUi.setState({ loaderMs: s.loaderMs })
      },
    },
  ),
)

export const useAvailable = () => useDemo((s) => available(s.ledger))

/** Display name of a Send recipient: a saved contact shows its contact name (Send BR-08). */
export function displayName(r: SendRecipient, saved: Record<string, string>): string {
  return saved[r.account] ?? r.name
}

/** parent BR-13 (web build): clear the persisted store and reload = reinstall. */
export function hardReset(): void {
  try {
    localStorage.removeItem(STORE_KEY)
  } catch {
    /* storage blocked: reload still restores the seed in memory */
  }
  location.replace(location.pathname)
}
