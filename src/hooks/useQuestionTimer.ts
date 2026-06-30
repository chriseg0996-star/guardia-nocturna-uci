import { useCallback, useEffect, useRef, useState } from 'react'

export function useQuestionTimer(
  seconds: number,
  enabled: boolean,
  active: boolean,
  onTimeout: () => void,
) {
  const [remaining, setRemaining] = useState(seconds)
  const fired = useRef(false)
  const onTimeoutRef = useRef(onTimeout)
  onTimeoutRef.current = onTimeout

  useEffect(() => {
    if (!active || !enabled) return
    fired.current = false
    setRemaining(seconds)
  }, [active, enabled, seconds])

  useEffect(() => {
    if (!active || !enabled || remaining <= 0) return
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(id)
  }, [active, enabled, remaining])

  useEffect(() => {
    if (!active || !enabled || remaining > 0 || fired.current) return
    fired.current = true
    onTimeoutRef.current()
  }, [active, enabled, remaining])

  const progress = enabled && seconds > 0 ? remaining / seconds : 1

  return { remaining, progress, reset: useCallback(() => setRemaining(seconds), [seconds]) }
}
