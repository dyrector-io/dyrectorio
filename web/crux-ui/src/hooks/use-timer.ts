import { SECOND_IN_MILLIS } from '@app/const'
import { useEffect, useRef, useState } from 'react'

const useTimer = (
  initialTimeout?: number,
  onExpire?: VoidFunction,
): [number, (timeout?: number) => void, VoidFunction] => {
  const [remaining, setRemaining] = useState(initialTimeout ?? -1)
  const expireCallback = useRef<VoidFunction>(null)
  const timer = useRef<NodeJS.Timeout>(null)

  expireCallback.current = onExpire

  useEffect(() => {
    if (remaining > 0) {
      timer.current = setTimeout(() => setRemaining(remaining - 1), SECOND_IN_MILLIS)
    } else {
      timer.current = null
      if (timer !== null) {
        expireCallback.current?.call(null)
      }
    }
  }, [remaining])

  return [remaining, (timeout: number) => setRemaining(timeout), () => clearTimeout(timer.current)]
}

export default useTimer
