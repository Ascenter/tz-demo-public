import { useCallback } from 'react'
import { Keypad } from './Keypad'
import { PrimaryButton } from './PrimaryButton'
import { Icon } from './icons'
import { formatNumber, formatTZS, parseAmount } from '../engine/format'

const MAX_DIGITS = 9

interface Props {
  value: string
  onChange: (v: string) => void
  /** Grey lines under the amount (balance, "No fee"). */
  hints: string[]
  /** Red line under the amount; replaces the hints (parent BR-05 pattern). */
  error?: string
  comment?: { value: string; onChange: (v: string) => void; placeholder: string }
  chips?: readonly number[]
  button: { label: string; disabled: boolean; onClick: () => void }
}

/** Amount screen body: big amount (Figma "FFTextInputAmount"), comment, button, chips, keypad. */
export function AmountEntry({ value, onChange, hints, error, comment, chips = [], button }: Props) {
  const amount = parseAmount(value)
  const onDigit = useCallback(
    (d: string) => {
      const next = (value + d).replace(/^0+/, '')
      if (next.length <= MAX_DIGITS) onChange(next)
    },
    [value, onChange],
  )
  const onDelete = useCallback(() => onChange(value.slice(0, -1)), [value, onChange])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-[150px] flex-1 flex-col items-center justify-center px-5">
        {/* Figma layout: amount, caret, then the currency (text lines elsewhere use "TZS 25,000", BR-14). */}
        <div className="flex items-center gap-[2px]" data-testid="amount-display">
          <span
            data-testid="amount-value"
            className={`font-display text-amount-input font-semibold ${value ? 'text-primary' : 'text-black/25'}`}
          >
            {value ? formatNumber(amount) : '0'}
          </span>
          <span className="caret h-9 w-[2px] rounded bg-black" />
          <span className="font-display text-amount-input font-semibold">&nbsp;TZS</span>
        </div>
        <div className="mt-[2px] flex flex-col items-center">
          {error ? (
            <p data-testid="red-line" role="alert" className="text-center text-caption text-error">
              {error}
            </p>
          ) : (
            hints.map((h) => (
              <p key={h} data-testid="amount-hint" className="text-center text-caption text-secondary">
                {h}
              </p>
            ))
          )}
        </div>
      </div>

      {comment && (
        <label className="mx-5 mb-3 flex items-center gap-2 rounded-field bg-tertiary-bg py-[7px] pl-3 pr-5">
          <Icon name="chat" size={20} color="rgba(0,0,0,0.3)" />
          <input
            data-testid="comment"
            value={comment.value}
            onChange={(e) => comment.onChange(e.target.value)}
            placeholder={comment.placeholder}
            maxLength={60}
            enterKeyHint="done"
            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            className="min-w-0 flex-1 bg-transparent py-[3px] text-[16px] leading-[20px] outline-none placeholder:text-black/40"
          />
        </label>
      )}

      <div className="px-5 pb-[10px]">
        <PrimaryButton data-testid="amount-primary" disabled={button.disabled} onClick={button.onClick}>
          {button.label}
        </PrimaryButton>
      </div>
      {chips.length > 0 && (
        <div className="flex justify-center gap-[10px] px-5 pb-[10px]">
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              data-testid={`chip-${c}`}
              onClick={() => onChange(String(c))}
              className="pressable rounded-component bg-chip-bg px-3 py-2 text-caption text-chip-text"
            >
              {formatTZS(c)}
            </button>
          ))}
        </div>
      )}
      <Keypad onDigit={onDigit} onDelete={onDelete} />
    </div>
  )
}
