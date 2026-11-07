import { useRef, type ComponentProps } from 'react'
import { PrimaryButton } from './PrimaryButton'

/**
 * Confirm button that locks on the first tap (parent error table "Repeated tap": one operation).
 * The lock lives as long as the button is mounted; sheets remount their content on every open.
 */
export function ConfirmButton({ onClick, ...rest }: ComponentProps<typeof PrimaryButton>) {
  const locked = useRef(false)
  return (
    <PrimaryButton
      {...rest}
      onClick={(e) => {
        if (locked.current) return
        locked.current = true
        onClick?.(e)
      }}
    />
  )
}
