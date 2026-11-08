import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Receipt } from './Receipt'
import { DATE_TOKEN, type Operation } from '../engine/money'
import { formatDateTime } from '../engine/format'
import { t } from '../mock/texts'

/**
 * Transaction details for a history entry that carries `details` (Cash v5: the receipt moved here).
 * Opens over Home as a pushed screen; Done, back icon or edge swipe close it.
 */
export function TransactionDetails({ op, onClose }: { op: Operation | null; onClose: () => void }) {
  const root = document.getElementById('overlay-root') ?? document.body
  return createPortal(
    <AnimatePresence>
      {op?.details && (
        <motion.div
          key={op.id}
          className="absolute inset-0 z-30"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', ease: [0.32, 0.72, 0, 1], duration: 0.38 }}
        >
          <Receipt
            testId="transaction-details"
            amount={op.amount}
            status={op.details.status}
            blocks={op.details.blocks.map((rows) =>
              rows.map(([label, value]) => [label, value === DATE_TOKEN ? formatDateTime(new Date(op.at)) : value]),
            )}
            doneLabel={t('payments.common.done')}
            onDone={onClose}
          />
        </motion.div>
      )}
    </AnimatePresence>,
    root,
  )
}
