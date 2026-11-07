import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useAnimationControls } from 'motion/react'
import { Screen } from './Screen'
import { NavBar } from './NavBar'
import { Keypad } from './Keypad'
import { t } from '../mock/texts'
import { CUSTOMER } from '../mock/seed'
import { isExpired, startOtp, submitOtp, type OtpState } from '../engine/otp'
import { now } from '../engine/clock'
import { useUi } from '../app/ui'
import { useBack } from '../app/back'

const LEN = 6

interface Props {
  /** Code passed: the flow runs the simulated operation. */
  onSuccess: () => void
  /** Back, 3rd wrong code or expired code: the operation is cancelled, no debit (parent BR-09). */
  onCancel: () => void
}

/** OTP confirmation for money going out that the customer starts (parent BR-09). No Figma frame. */
export function OtpScreen({ onSuccess, onCancel }: Props) {
  const [otp, setOtp] = useState<OtpState>(() => startOtp(now()))
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const done = useRef(false)
  const shake = useAnimationControls()
  useBack(onCancel)

  const cancelWith = useCallback(
    (toastKey: 'payments.common.otp_too_many' | 'payments.common.otp_expired') => {
      if (done.current) return
      done.current = true
      useUi.getState().showToast(t(toastKey))
      onCancel()
    },
    [onCancel],
  )

  // 10-minute validity runs in the background too.
  useEffect(() => {
    const id = setInterval(() => {
      if (isExpired(otp, now())) cancelWith('payments.common.otp_expired')
    }, 1000)
    return () => clearInterval(id)
  }, [otp, cancelWith])

  const submit = (full: string) => {
    const { state, result } = submitOtp(otp, full, now())
    setOtp(state)
    if (result === 'ok') {
      done.current = true
      onSuccess()
    } else if (result === 'expired') {
      cancelWith('payments.common.otp_expired')
    } else if (result === 'locked') {
      cancelWith('payments.common.otp_too_many')
    } else {
      setError(true)
      void shake.start({ x: [0, -10, 10, -6, 6, 0], transition: { duration: 0.35 } })
      setTimeout(() => setCode(''), 350)
    }
  }

  const onDigit = (d: string) => {
    if (done.current || code.length >= LEN) return
    setError(false)
    const next = code + d
    setCode(next)
    if (next.length === LEN) setTimeout(() => submit(next), 120)
  }
  const onDelete = () => {
    setError(false)
    setCode((c) => c.slice(0, -1))
  }
  const resend = () => {
    setOtp(startOtp(now()))
    setCode('')
    setError(false)
    useUi.getState().showToast(t('payments.common.otp_sent'))
  }

  return (
    <Screen testId="otp-screen" header={<NavBar onBack={onCancel} />} scroll={false}>
      <div className="flex flex-1 flex-col items-center px-5 pt-6">
        <h1 className="font-display text-toolbar-expanded font-semibold">{t('payments.common.otp_title')}</h1>
        <p className="mt-2 text-center text-body-m text-secondary">
          {t('payments.common.otp_subtitle', { phone: CUSTOMER.phoneMasked })}
        </p>
        <motion.div animate={shake} className="mt-8 flex gap-2" data-testid="otp-boxes">
          {Array.from({ length: LEN }, (_, i) => (
            <span
              key={i}
              className={`grid h-14 w-12 place-items-center rounded-[14px] font-display text-[28px] font-semibold ${
                error ? 'bg-error/10 text-error' : 'bg-tertiary-bg'
              } ${i === code.length && !error ? 'ring-2 ring-black/80' : ''}`}
            >
              {code[i] ?? ''}
            </span>
          ))}
        </motion.div>
        <p data-testid="otp-error" className="mt-3 h-5 text-body-m text-error">
          {error ? t('payments.common.otp_wrong') : ''}
        </p>
        <button type="button" data-testid="otp-resend" onClick={resend} className="pressable mt-4 text-body-mp font-semibold">
          {t('payments.common.otp_resend')}
        </button>
      </div>
      <Keypad onDigit={onDigit} onDelete={onDelete} />
    </Screen>
  )
}
