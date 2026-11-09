import type { ReactNode } from 'react'
import { Screen } from './Screen'
import { NavBar } from './NavBar'
import { ButtonBar, PrimaryButton } from './PrimaryButton'
import { Illustration } from './Illustration'
import { Icon } from './icons'
import { formatTZS } from '../engine/format'
import { useBack } from '../app/back'

/** `small`: the row is set in 14/20 instead of 15/20 (Figma: "TIPS reference" rows). */
export type ReceiptRow = [label: string, value: ReactNode | undefined, small?: 'small']

interface Props {
  amount: number
  status: string
  /** Blocks of rows separated by 24 px (Figma receipt "1 block", "2 block", …). Empty values are hidden. */
  blocks: ReceiptRow[][]
  /** Extra content under the rows (actions). */
  actions?: ReactNode
  onDone: () => void
  doneLabel: string
  /** No-BG button above Done (e.g. "Copy token"). */
  secondary?: { label: string; onClick: () => void; testId?: string }
  testId?: string
}

/** Success screen with receipt paper (Figma 130:2154 / 42:5875). Share icon shown, inactive. */
export function Receipt({ amount, status, blocks, actions, onDone, doneLabel, secondary, testId }: Props) {
  useBack(onDone)
  return (
    <Screen
      testId={testId}
      header={
        <NavBar
          right={
            <span aria-hidden="true" className="opacity-100">
              <Icon name="share" />
            </span>
          }
        />
      }
      footer={
        <ButtonBar gray>
          {secondary && (
            <PrimaryButton variant="nobg" data-testid={secondary.testId} onClick={secondary.onClick}>
              {secondary.label}
            </PrimaryButton>
          )}
          <PrimaryButton data-testid="receipt-done" onClick={onDone}>
            {doneLabel}
          </PrimaryButton>
        </ButtonBar>
      }
    >
      <div className="flex min-h-full flex-col items-center gap-6">
        <Illustration kind="receipt" />
        <div className="flex flex-col items-center gap-2 px-5">
          <p data-testid="receipt-amount" className="t-display-23">
            {formatTZS(amount)}
          </p>
          <p data-testid="receipt-status" className="flex items-center gap-1 t-regular-14 text-on-bg-secondary">
            <span aria-hidden="true" className="text-[13px]">✅</span>
            <span>{status}</span>
          </p>
        </div>
        {/* Label column as wide as the longest label + 24 pt (Figma: values at x = 112, or 140 with "TIPS reference"). */}
        <div className="receipt-paper w-full flex-1 px-5 pb-8 pt-12" data-testid="receipt-rows">
          <div className="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-6">
            {blocks
              .map((rows) => rows.filter(([, v]) => v !== undefined && v !== ''))
              .filter((rows) => rows.length)
              .flatMap((rows, i) =>
                rows.map(([label, value, small], j) => (
                  <div key={`${i}-${label}`} className={`contents ${small ? 't-regular-14' : 't-regular-15'}`}>
                    <span className={`text-on-bg-secondary ${rowGap(i, j)}`}>{label}</span>
                    <span className={`min-w-0 break-words text-on-bg-primary ${rowGap(i, j)}`}>{value}</span>
                  </div>
                )),
              )}
          </div>
          {actions && <div className="mt-6">{actions}</div>}
        </div>
      </div>
    </Screen>
  )
}

/** 8 pt between rows of a block, 24 pt between blocks. */
function rowGap(block: number, row: number): string {
  if (block === 0 && row === 0) return ''
  return row === 0 ? 'mt-6' : 'mt-2'
}
