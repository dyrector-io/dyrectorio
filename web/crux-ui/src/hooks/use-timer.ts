import { useEffect, useState } from 'react'

export const useTimer = (
  initialTimeout?: number,
  onExpire?: VoidFunction,
): [number, (timeout?: number) => void, VoidFunction] => {
  const [remaining, setRemaining] = useState(initialTimeout ?? -1)
  const [timer, setTimer] = useState(null)

  const step = () => setTimeout(() => setRemaining(remaining - 1), 1000)

  useEffect(() => {
    if (remaining > 0) {
      setTimer(step())
    } else {
      setTimer(null)
      if (timer !== null) {
        setTimer(null)
        onExpire?.call(null)
      }
    }
  }, [remaining])

  return [remaining, (timeout: number) => setRemaining(timeout), () => clearTimeout(timer)]
}
