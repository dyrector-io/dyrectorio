import { useEffect, useRef } from 'react'

function useInterval(onTick: VoidFunction, interval: number | null) {
  const callback = useRef(onTick)
  const timer = useRef<NodeJS.Timer>(null)

  if (onTick !== callback.current) {
    callback.current = onTick
  }

  useEffect(() => {
    if (timer.current) {
      clearInterval(timer.current)
    }

    if (!interval && interval !== 0) {
      return () => {}
    }

    timer.current = setInterval(() => callback.current(), interval)

    return () => clearInterval(timer.current)
  }, [interval])
}

export default useInterval
