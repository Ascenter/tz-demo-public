import { MemoryRouter, Route, Routes, useLocation, useNavigationType } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { useRef } from 'react'
import { Home } from '../screens/Home'
import { Payments } from '../screens/Payments'
import { Placeholder } from '../screens/Placeholder'
import { TabBar, TAB_PATHS } from './TabBar'
import { FundRoute } from '../flows/fund/FundFlow'
import { SendFlow } from '../flows/send/SendFlow'
import { ScanFlow } from '../flows/scan/ScanFlow'
import { CashFlow } from '../flows/cash/CashFlow'
import { AirtimeFlow } from '../flows/airtime/AirtimeFlow'
import { GovFlow } from '../flows/gov/GovFlow'
import { BillsFlow } from '../flows/bills/BillsFlow'

// Memory router inside the phone shell: no URL bar or browser back/forward artefacts in the standalone PWA.
export function AppRouter() {
  return (
    <MemoryRouter initialEntries={['/']}>
      <AnimatedRoutes />
    </MemoryRouter>
  )
}

const variants = {
  enter: (d: number) => (d === 0 ? { x: 0, opacity: 1 } : { x: d > 0 ? '100%' : '-28%', zIndex: d > 0 ? 2 : 0 }),
  center: { x: 0, opacity: 1, zIndex: 1 },
  exit: (d: number) => (d === 0 ? { opacity: 1, transition: { duration: 0 } } : { x: d > 0 ? '-28%' : '100%', zIndex: d > 0 ? 0 : 2 }),
}

function AnimatedRoutes() {
  const location = useLocation()
  const navType = useNavigationType()
  const state = (location.state ?? {}) as { tab?: boolean; back?: boolean }
  const dir = state.tab ? 0 : navType === 'POP' || state.back ? -1 : 1
  const first = useRef(true)
  const isTab = TAB_PATHS.includes(location.pathname)
  const initial = first.current ? false : 'enter'
  first.current = false

  return (
    <>
      <AnimatePresence initial={false} custom={dir}>
        <motion.div
          key={location.key}
          custom={dir}
          variants={variants}
          initial={initial}
          animate="center"
          exit="exit"
          transition={{ type: 'tween', ease: [0.32, 0.72, 0, 1], duration: dir === 0 ? 0 : 0.38 }}
          className="absolute inset-0 overflow-hidden bg-surface"
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/credit" element={<Placeholder kind="credit" />} />
            <Route path="/savings" element={<Placeholder kind="savings" />} />
            <Route path="/more" element={<Placeholder kind="more" />} />
            <Route path="/fund" element={<FundRoute />} />
            <Route path="/send" element={<SendFlow />} />
            <Route path="/scan" element={<ScanFlow />} />
            <Route path="/cash" element={<CashFlow />} />
            <Route path="/airtime" element={<AirtimeFlow />} />
            <Route path="/gov" element={<GovFlow />} />
            <Route path="/bills" element={<BillsFlow />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
      {isTab && <TabBar />}
    </>
  )
}
