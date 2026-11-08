import { useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useUi } from './ui'
import { useDemo, hardReset } from './store'
import { useBack } from './back'
import { MASTER_SCRIPT } from '../mock/masterScript'
import { LOADER_OPTIONS_MS } from '../mock/scripted'
import { t } from '../mock/texts'
import { IS_FULLSCREEN } from './bootReset'

/**
 * Hidden presenter menu: long-press (≥1 s) on the Home balance or triple-tap on the status bar.
 * Styled on purpose as a dev tool, not as part of the app.
 */
export function DemoMenu() {
  const open = useUi((s) => s.demoMenuOpen)
  const root = document.getElementById('overlay-root') ?? document.body
  return createPortal(<AnimatePresence>{open && <MenuBody />}</AnimatePresence>, root)
}

function MenuBody() {
  const close = () => useUi.getState().setDemoMenu(false)
  useBack(close)
  const simulateScan = useUi((s) => s.simulateScan)
  const { loaderMs, setLoaderMs, jumpToStep, showFrame, setShowFrame } = useDemo()
  const [confirmReset, setConfirmReset] = useState(false)

  const run = (fn: () => void) => () => {
    close()
    setTimeout(fn, 220)
  }

  return (
    <div className="absolute inset-0 z-[90]" data-testid="demo-menu">
      <motion.div className="absolute inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} />
      <motion.div
        className="absolute inset-x-0 bottom-0 max-h-[85%] overflow-y-auto rounded-t-[20px] border-t-4 border-[#ffcc00] bg-[#1c1c1e] px-4 pt-4 font-mono text-[13px] text-[#e5e5ea]"
        style={{ paddingBottom: 'calc(var(--safe-bottom) + 16px)' }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 340 }}
      >
        <div className="mb-3 flex items-start justify-between">
          <div>
            <p className="text-[15px] font-bold text-[#ffcc00]">🛠 {t('demo.title')}</p>
            <p className="text-[11px] text-[#8e8e93]">{t('demo.subtitle')}</p>
          </div>
          <button type="button" data-testid="demo-close" onClick={close} className="rounded bg-[#3a3a3c] px-3 py-1">
            {t('demo.close')}
          </button>
        </div>

        <DevButton testId="demo-simulate-qr" disabled={!simulateScan} hint={t('demo.simulate_qr_hint')} onClick={run(() => simulateScan?.())}>
          {t('demo.simulate_qr')}
        </DevButton>

        <Section title={t('demo.jump')} hint={t('demo.jump_hint')}>
          <div className="grid grid-cols-8 gap-1">
            {MASTER_SCRIPT.map((s) => (
              <button
                key={s.step}
                type="button"
                data-testid={`demo-jump-${s.step}`}
                onClick={run(() => {
                  jumpToStep(s.step)
                  useUi.getState().showToast(t('demo.jump_done', { n: s.step }))
                })}
                className="rounded bg-[#3a3a3c] py-2 active:bg-[#48484a]"
              >
                {s.step}
              </button>
            ))}
          </div>
        </Section>

        <Section title={t('demo.loader')}>
          <div className="flex gap-1">
            {LOADER_OPTIONS_MS.map((ms) => (
              <button
                key={ms}
                type="button"
                data-testid={`demo-loader-${ms}`}
                onClick={() => setLoaderMs(ms)}
                className={`flex-1 rounded py-2 ${loaderMs === ms ? 'bg-[#ffcc00] text-black' : 'bg-[#3a3a3c]'}`}
              >
                {ms} ms
              </button>
            ))}
          </div>
        </Section>

        {!IS_FULLSCREEN && (
          <Section title={t('demo.frame')}>
            <div className="flex gap-1">
              {[true, false].map((v) => (
                <button
                  key={String(v)}
                  type="button"
                  onClick={() => setShowFrame(v)}
                  className={`flex-1 rounded py-2 ${showFrame === v ? 'bg-[#ffcc00] text-black' : 'bg-[#3a3a3c]'}`}
                >
                  {v ? t('demo.frame_show') : t('demo.frame_hide')}
                </button>
              ))}
            </div>
          </Section>
        )}

        <DevButton
          testId="demo-reset"
          danger
          hint={t('demo.reset_hint')}
          onClick={() => (confirmReset ? hardReset() : setConfirmReset(true))}
        >
          {confirmReset ? t('demo.reset_confirm') : t('demo.reset')}
        </DevButton>

        <p className="mt-3 text-center text-[11px] text-[#8e8e93]">
          {t('demo.version', { version: __APP_VERSION__, date: __BUILD_DATE__ })}
        </p>
      </motion.div>
    </div>
  )
}

function DevButton(props: { children: React.ReactNode; onClick: () => void; disabled?: boolean; hint?: string; danger?: boolean; testId?: string }) {
  return (
    <button
      type="button"
      data-testid={props.testId}
      disabled={props.disabled}
      onClick={props.onClick}
      className={`mb-2 flex w-full flex-col items-start rounded-lg px-3 py-[10px] text-left disabled:opacity-35 ${
        props.danger ? 'bg-[#3a1d1d] text-[#ff6b6b]' : 'bg-[#2c2c2e] active:bg-[#3a3a3c]'
      }`}
    >
      <span className="font-bold">{props.children}</span>
      {props.hint && <span className="text-[11px] text-[#8e8e93]">{props.hint}</span>}
    </button>
  )
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-2 rounded-lg bg-[#2c2c2e] px-3 py-[10px]">
      <p className="mb-2 font-bold">{title}</p>
      {hint && <p className="-mt-2 mb-2 text-[11px] text-[#8e8e93]">{hint}</p>}
      {children}
    </div>
  )
}
