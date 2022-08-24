import { useEffect, useRef, useState } from 'react'

type ThrottledAction = {
  trigger: VoidFunction
}

export const CANCEL_THROTTLE = () => {}

export const useThrottling = (delay: number): ((action: VoidFunction) => void) => {
  const [action, setAction] = useState<ThrottledAction>()
  const schedule = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!action) {
      return
    }

    if (schedule.current) {
      clearTimeout(schedule.current)
    }

    schedule.current = setTimeout(() => action.trigger(), delay)
  }, [action, delay, schedule])

  return trigger =>
    setAction({
      trigger,
    })
}
