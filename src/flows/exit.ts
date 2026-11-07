import { useCallback } from 'react'
import { useNavigate } from 'react-router'

/** Leave the flow back to the screen it started from (Home or Payments). */
export function useExitFlow() {
  const navigate = useNavigate()
  return useCallback(() => navigate(-1), [navigate])
}

/** Gov and Bills receipts: Done opens Home (child BRD deviation). */
export function useExitToHome() {
  const navigate = useNavigate()
  return useCallback(() => navigate('/', { replace: true, state: { back: true } }), [navigate])
}
