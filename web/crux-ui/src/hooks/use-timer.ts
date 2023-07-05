import { SECOND_IN_MILLIS } from '@app/const'
import { useCallback, useRef, useState } from 'react'
import useInterval from './use-interval'

const useTimer = (
  initialTimeout?: number | null,
  onExpire?: VoidFunction,
): [number, (timeout: number) => void, VoidFunction] => {
  const currentOnExpire = useRef(onExpire)
  const [remaining, setRemaining] = useState(initialTimeout ?? null)

  const onIntervalExpire = useCallback(() => {
    const newRemaining = remaining - 1
    setRemaining(newRemaining)

    if (newRemaining < 1) {
      setRemaining(null)
      currentOnExpire.current?.call(null)
    }
  }, [remaining])

  const start = useCallback((timeout: number) => setRemaining(timeout), [])
  const cancel = useCallback(() => setRemaining(null), [])

  useInterval(onIntervalExpire, remaining < 1 ? null : SECOND_IN_MILLIS)

  return [remaining, start, cancel]
}

export default useTimer
