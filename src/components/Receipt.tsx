import type { ReactNode } from 'react'
import { Screen } from './Screen'
import { NavBar } from './NavBar'
import { ButtonBar, PrimaryButton } from './PrimaryButton'
import { Illustration } from './Illustration'
import { Icon } from './icons'
import { formatTZS } from '../engine/format'
import { useBack } from '../app/back'

export type ReceiptRow = [label: string, value: ReactNode | undefined]

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
      <div className="flex min-h-full flex-col items-center gap-6 pt-2">
        <Illustration kind="success" size={140} />
        <div className="flex flex-col items-center gap-2 px-5">
          <p data-testid="receipt-amount" className="t-display-23">
            {formatTZS(amount)}
          </p>
          <p data-testid="receipt-status" className="flex items-center gap-1 t-regular-14 text-on-bg-secondary">
            <span className="text-[13px]">✅</span>
            {status}
          </p>
        </div>
        <div className="receipt-paper w-full flex-1 px-5 pb-8 pt-10" data-testid="receipt-rows">
          <div className="flex flex-col gap-6">
            {blocks.map((rows, i) => {
              const visible = rows.filter(([, v]) => v !== undefined && v !== '')
              if (!visible.length) return null
              return (
                <div key={i} className="flex flex-col gap-2">
                  {visible.map(([label, value]) => (
                    <div key={label} className="flex gap-6 t-regular-15">
                      <span className="w-[116px] shrink-0 text-on-bg-secondary">{label}</span>
                      <span className="min-w-0 flex-1 break-words text-on-bg-primary">{value}</span>
                    </div>
                  ))}
                </div>
              )
            })}
            {actions}
          </div>
        </div>
      </div>
    </Screen>
  )
}
