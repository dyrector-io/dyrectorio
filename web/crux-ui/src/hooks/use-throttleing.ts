import { useCallback, useEffect, useRef, useState } from 'react'

type Throttling = (action: VoidFunction, immediate?: boolean) => void

type ThrottledAction = {
  trigger: VoidFunction
  resetTimer?: boolean
}

export const CANCEL_THROTTLE = () => {}

export const useThrottling = (delay: number): Throttling => {
  const [action, setAction] = useState<ThrottledAction>()
  const schedule = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!action) {
      return () => {}
    }

    if (schedule.current) {
      clearTimeout(schedule.current)
    }

    schedule.current = action.resetTimer
      ? setTimeout(() => action.trigger())
      : setTimeout(() => action.trigger(), delay)
    return () => clearTimeout(schedule.current)
  }, [action, delay, schedule])

  return useCallback(
    (trigger, resetTimer = false) =>
      setAction({
        trigger,
        resetTimer,
      }),
    [],
  )
}
