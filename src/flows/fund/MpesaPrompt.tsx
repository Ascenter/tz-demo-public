import { AnimatePresence, motion } from 'motion/react'
import { t } from '../../mock/texts'
import { FUND } from '../../mock/scripted'
import { formatNumber } from '../../engine/format'

/** Emulated M-Pesa USSD push prompt (Fund BR-03, BR-09): no PIN field, no timeout. */
export function MpesaPrompt({ open, amount, onCancel, onSend }: { open: boolean; amount: number; onCancel: () => void; onSend: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-30 grid place-items-center bg-modal-bg px-[66px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            role="alertdialog"
            data-testid="mpesa-prompt"
            className="w-full overflow-hidden rounded-[14px] bg-[#f2f2f7]/95 text-center backdrop-blur-xl"
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 380 }}
          >
            <div className="px-4 pb-4 pt-5">
              <p className="t-semibold-16 text-on-bg-primary">{t('payments.fund_account.prompt_title')}</p>
              <p className="mt-2 t-regular-13 text-on-bg-primary">
                {t('payments.fund_account.prompt_body', { amount: formatNumber(amount), merchant: FUND.merchantName, ref: FUND.promptRef })}
              </p>
            </div>
            <div className="flex border-t border-black/15">
              <button type="button" data-testid="mpesa-cancel" onClick={onCancel} className="h-11 flex-1 border-r border-black/15 t-ios-alert-button text-cobalt-blue active:bg-black/5">
                {t('payments.fund_account.cancel')}
              </button>
              <button type="button" data-testid="mpesa-send" onClick={onSend} className="h-11 flex-1 t-ios-alert-button text-cobalt-blue active:bg-black/5">
                {t('payments.fund_account.send')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
