import { useRef } from 'react'
import { useThrottling } from './use-throttleing'

type Patcher<T extends object> = (patch: Partial<T>) => void

const usePatcher = <T extends object>(delay: number, onPatch: Patcher<T>): Patcher<T> => {
  const cache = useRef<Partial<T>>({})
  const throttle = useThrottling(delay)

  return (patch: Partial<T>) => {
    const newPatch = {
      ...cache.current,
      ...patch,
    }
    cache.current = newPatch

    throttle(() => {
      onPatch(cache.current)

      cache.current = {}
    })
  }
}

export default usePatcher
