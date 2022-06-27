import { useEffect, useState } from 'react'

export const useTimer = (
  timeout: number,
  onExpire?: VoidFunction,
): [number, VoidFunction] => {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    if (remaining > 0) {
      setTimeout(() => setRemaining(remaining - 1), 1000)
    } else if (onExpire) {
      onExpire()
    }
  }, [remaining])

  return [remaining, () => setRemaining(timeout)]
}
