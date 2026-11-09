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
  /** Extra space above the amount block (Airtime keeps the hidden Airtime/Data switch's room). */
  offsetTop?: number
}

/** Amount screen body: big amount (Figma "FFTextInputAmount"), comment, button, chips, keypad. */
export function AmountEntry({ value, onChange, hints, error, comment, chips = [], button, offsetTop = 0 }: Props) {
  const amount = parseAmount(value)
  const onDigit = useCallback(
    (d: string) => {
      const next = (value + d).replace(/^0+/, '')
      if (next.length <= MAX_DIGITS) onChange(next)
    },
    [value, onChange],
  )
  const onDelete = useCallback(() => onChange(value.slice(0, -1)), [value, onChange])

  const lines = error ? [error] : hints
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Amount block, centred between the header and the comment slot (Figma: centre at y≈277 on 402 × 874). */}
      <div className="flex min-h-[150px] flex-1 flex-col items-center justify-center px-5" style={{ paddingTop: offsetTop }}>
        {/* Currency first, as everywhere else (BR-14, Figma 49:4304), caret after the number. */}
        <div className="flex items-center" data-testid="amount-display">
          <span className={`t-display-40 whitespace-nowrap ${value ? 'text-on-bg-primary' : 'text-on-bg-disabled'}`}>
            TZS&nbsp;<span data-testid="amount-value">{value ? formatNumber(amount) : '0'}</span>
          </span>
          <span className="caret ml-[2px] h-9 w-[2px] rounded bg-on-bg-primary" />
        </div>
        {/* One line sits 8 pt under the amount, two lines 2 pt (Figma 49:4304 vs 1:10244). */}
        <div className="flex flex-col items-center" style={{ marginTop: lines.length > 1 ? 2 : 8 }}>
          {error ? (
            <p data-testid="red-line" role="alert" className="text-center t-regular-13 text-error-hint">
              {error}
            </p>
          ) : (
            hints.map((h) => (
              <p key={h} data-testid="amount-hint" className="text-center t-regular-13 text-on-bg-secondary">
                {h}
              </p>
            ))
          )}
        </div>
      </div>

      {/* Comment slot: 40 pt field + 12 pt gap above the button; the same space stays empty without a comment. */}
      <div className="h-[52px] shrink-0 px-5">
        {comment && (
          <label className="flex h-10 items-center gap-2 rounded-field bg-field-bg pl-3 pr-5">
            <Icon name="chat" size={20} color="var(--color-icon-30)" />
            <input
              data-testid="comment"
              value={comment.value}
              onChange={(e) => comment.onChange(e.target.value)}
              placeholder={comment.placeholder}
              maxLength={60}
              enterKeyHint="done"
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
              className="min-w-0 flex-1 bg-transparent t-regular-13 text-on-bg-primary outline-none placeholder:text-on-bg-secondary"
            />
          </label>
        )}
      </div>

      <div className="px-5 pb-[10px]">
        <PrimaryButton data-testid="amount-primary" disabled={button.disabled} onClick={button.onClick}>
          {button.label}
        </PrimaryButton>
      </div>
      {/* Chips row (34 pt + 10 pt). Flows without chips (Send, Scan) keep the space so the button stays put. */}
      <div className="flex h-[44px] shrink-0 justify-center gap-[10px] px-5 pb-[10px]">
        {chips.map((c) => (
          <button
            key={c}
            type="button"
            data-testid={`chip-${c}`}
            onClick={() => onChange(String(c))}
            className="pressable rounded-full bg-chips-bg px-3 py-2 t-regular-13 text-chips-text"
          >
            {formatTZS(c)}
          </button>
        ))}
      </div>
      <Keypad onDigit={onDigit} onDelete={onDelete} />
    </div>
  )
}
