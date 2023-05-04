import { useEffect, useRef } from 'react'

function useInterval(onTick: VoidFunction, interval: number | null) {
  const callback = useRef(onTick)
  if (onTick !== callback.current) {
    callback.current = onTick
  }

  useEffect(() => {
    if (!interval && interval !== 0) {
      return () => {}
    }

    const timer = setInterval(() => callback.current(), interval)

    return () => clearInterval(timer)
  }, [interval])
}

export default useInterval
