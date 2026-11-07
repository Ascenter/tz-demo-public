import { describe, expect, it } from 'vitest'
import { startOtp, submitOtp } from '../../src/engine/otp'

const T0 = 1_000_000

describe('OTP state machine (parent BR-09)', () => {
  it('123456 passes', () => {
    expect(submitOtp(startOtp(T0), '123456', T0 + 1000).result).toBe('ok')
  })
  it('wrong, wrong, then locked on the 3rd wrong', () => {
    let s = startOtp(T0)
    let r = submitOtp(s, '111111', T0)
    expect(r.result).toBe('wrong')
    s = r.state
    r = submitOtp(s, '222222', T0)
    expect(r.result).toBe('wrong')
    s = r.state
    r = submitOtp(s, '333333', T0)
    expect(r.result).toBe('locked')
  })
  it('expires after 10 minutes, even with the right code', () => {
    expect(submitOtp(startOtp(T0), '123456', T0 + 10 * 60 * 1000).result).toBe('expired')
  })
  it('a new code restarts 10 minutes and 3 attempts', () => {
    const used = submitOtp(submitOtp(startOtp(T0), '000000', T0).state, '000000', T0).state
    expect(used.attemptsLeft).toBe(1)
    const fresh = startOtp(T0 + 9 * 60 * 1000)
    expect(fresh.attemptsLeft).toBe(3)
    expect(submitOtp(fresh, '123456', T0 + 18 * 60 * 1000).result).toBe('ok')
  })
})
