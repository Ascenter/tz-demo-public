import type { InputHTMLAttributes, ReactNode } from 'react'
import { Icon } from './icons'

/** Search field (Figma "field search"). Inactive = shown but not focusable (Gov BR-10, Bills BR-03). */
export function SearchField({
  inactive,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { inactive?: boolean }) {
  return (
    <label className="mx-5 flex h-10 items-center gap-2 rounded-full bg-field-bg px-3">
      <Icon name="search" size={24} color="var(--color-on-bg-secondary)" />
      <input
        {...rest}
        readOnly={inactive || rest.readOnly}
        tabIndex={inactive ? -1 : undefined}
        onFocus={inactive ? (e) => e.currentTarget.blur() : rest.onFocus}
        className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-black/40"
      />
    </label>
  )
}

/** 56 px form field with a floating label (Figma "field"). */
export function TextField({
  label,
  readOnlyValue,
  error,
  below,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; readOnlyValue?: ReactNode; error?: string; below?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label
        className={`flex h-14 flex-col justify-center rounded-field px-4 ${
          error ? 'bg-error-hint/10' : 'bg-field-bg'
        } ${readOnlyValue !== undefined ? 'opacity-70' : ''}`}
      >
        <span className="text-[12px] leading-4 text-on-bg-secondary">{label}</span>
        {readOnlyValue !== undefined ? (
          <span className="t-regular-16">{readOnlyValue}</span>
        ) : (
          <input {...rest} className="min-w-0 bg-transparent text-[16px] leading-[22px] outline-none placeholder:text-black/30" />
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
    <p data-testid="red-line" role="alert" className="t-regular-13 text-error-hint">
      {children}
    </p>
  )
}
