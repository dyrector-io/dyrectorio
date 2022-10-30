import { useEffect, useRef, useState } from 'react'

const useTicker = (millis: number): number => {
  const [tick, setTick] = useState(0)
  const expiration = useRef(millis)
  const timeout = useRef<NodeJS.Timeout>(null)

  useEffect(() => {
    if (!timeout.current) {
      timeout.current = setTimeout(() => {
        timeout.current = null
        setTick(tick + 1)
      }, expiration.current)
    }
  }, [tick])

  return tick
}

export default useTicker
