import { OTP } from '../mock/scripted'

export interface OtpState {
  attemptsLeft: number
  expiresAt: number
}

export type OtpResult = 'ok' | 'wrong' | 'locked' | 'expired'

// parent BR-09: code valid 10 min, 3 attempts; "Send new code" restarts both.
export function startOtp(nowMs: number): OtpState {
  return { attemptsLeft: OTP.attempts, expiresAt: nowMs + OTP.ttlMs }
}

export function isExpired(s: OtpState, nowMs: number): boolean {
  return nowMs >= s.expiresAt
}

export function submitOtp(s: OtpState, code: string, nowMs: number): { state: OtpState; result: OtpResult } {
  if (isExpired(s, nowMs)) return { state: s, result: 'expired' }
  if (code === OTP.code) return { state: s, result: 'ok' }
  const next = { ...s, attemptsLeft: s.attemptsLeft - 1 }
  return { state: next, result: next.attemptsLeft <= 0 ? 'locked' : 'wrong' }
}
