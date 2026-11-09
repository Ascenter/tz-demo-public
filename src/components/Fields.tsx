import { useRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Icon } from './icons'

/**
 * Search field (Figma "field search"): 40 pt, radius 16, 24 pt search icon, clear button while there is text.
 * Inactive = shown but not focusable (Gov BR-10, Bills BR-03).
 */
export function SearchField({
  inactive,
  onClear,
  className = 'mx-5',
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { inactive?: boolean; onClear?: () => void; className?: string }) {
  return (
    <label className={`flex h-10 min-w-0 items-center gap-2 rounded-field bg-field-bg pl-3 pr-3 ${className}`}>
      <Icon name="search" size={24} color="var(--color-on-bg-secondary)" />
      <input
        {...rest}
        readOnly={inactive || rest.readOnly}
        tabIndex={inactive ? -1 : undefined}
        onFocus={inactive ? (e) => e.currentTarget.blur() : rest.onFocus}
        className="min-w-0 flex-1 bg-transparent t-regular-16 text-on-bg-primary outline-none placeholder:text-on-bg-secondary"
      />
      {onClear && rest.value ? (
        <button type="button" aria-label="Clear" data-testid="search-clear" onClick={onClear} className="pressable grid size-6 place-items-center">
          <Icon name="clear" size={16} color="var(--color-on-bg-primary)" />
        </button>
      ) : null}
    </label>
  )
}

/**
 * 56 pt form field (Figma "field"): empty and idle → the label is the placeholder (16/22, 50 %);
 * focused or filled → 12/16 label over a 16/22 value; focused = black label, darker fill, clear button.
 * readOnlyValue: a fixed value — `chevron` for a picker (Bank, 42:6548), otherwise disabled at 30 % (19:7357).
 */
export function TextField({
  label,
  readOnlyValue,
  chevron,
  error,
  below,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; readOnlyValue?: ReactNode; chevron?: boolean; error?: string; below?: ReactNode }) {
  const [focused, setFocused] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  const fixed = readOnlyValue !== undefined
  const disabled = fixed && !chevron
  const empty = !fixed && !rest.value
  const clear = () => {
    const el = ref.current
    if (!el) return
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, '')
    el.dispatchEvent(new Event('input', { bubbles: true }))
    el.focus()
  }
  return (
    <div className="flex flex-col gap-1">
      <label
        className={`relative flex h-14 items-center gap-2 rounded-field px-4 ${
          error ? 'bg-error-hint/10' : focused ? 'bg-black/[0.12]' : 'bg-field-bg'
        }`}
      >
        <span className="flex min-w-0 flex-1 flex-col">
          {empty && !focused ? null : (
            <span className={`t-regular-12 ${disabled ? 'text-on-bg-disabled' : focused ? 'text-on-bg-primary' : 'text-on-bg-secondary'}`}>{label}</span>
          )}
          {fixed ? (
            <span className={`t-regular-16 ${disabled ? 'text-on-bg-disabled' : 'text-on-bg-primary'}`}>{readOnlyValue}</span>
          ) : (
            <input
              {...rest}
              ref={ref}
              placeholder={empty && !focused ? label : rest.placeholder}
              onFocus={(e) => {
                setFocused(true)
                rest.onFocus?.(e)
              }}
              onBlur={(e) => {
                setFocused(false)
                rest.onBlur?.(e)
              }}
              className={`min-w-0 bg-transparent text-on-bg-primary outline-none placeholder:text-on-bg-secondary ${focused ? 't-semibold-16' : 't-regular-16'}`}
            />
          )}
        </span>
        {chevron && <Icon name="chevronDown" size={16} color="var(--color-on-bg-secondary)" />}
        {focused && !empty && (
          <button type="button" aria-label="Clear" onPointerDown={(e) => e.preventDefault()} onClick={clear} className="grid size-6 place-items-center">
            <Icon name="clear" size={16} color="var(--color-on-bg-primary)" />
          </button>
        )}
      </label>
      {error && (
        <p data-testid="red-line" role="alert" className="px-4 t-regular-13 text-error-hint">
          {error}
        </p>
      )}
      {below}
    </div>
  )
}

/** Red error line under a field or amount (parent BR-05 pattern). */
export function RedLine({ children }: { children: ReactNode }) {
  return (
    <p data-testid="red-line" role="alert" className="text-center t-regular-13 text-error-hint">
      {children}
    </p>
  )
}
