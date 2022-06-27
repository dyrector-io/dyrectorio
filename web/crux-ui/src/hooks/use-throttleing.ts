import { useEffect, useState } from 'react'

type ThrottledAction = {
  trigger: VoidFunction
}

export const useThrottleing = (delay: number): ((action: VoidFunction) => void) => {
  const [action, setAction] = useState<ThrottledAction>()
  const [schedule, setSchedule] = useState<NodeJS.Timeout>()

  useEffect(() => {
    if (!action) {
      return
    }

    if (schedule) {
      clearTimeout(schedule)
    }

    const timeout = setTimeout(() => {
      action.trigger()
    }, delay)

    setSchedule(timeout)
  }, [action])

  return trigger =>
    setAction({
      trigger,
    })
}
