import { MutableRefObject, useEffect, useRef, useState } from 'react'

type OverflowState = 'clear' | 'overflow'

export const useOverflowDetection = <T extends HTMLElement>(): [boolean, MutableRefObject<T>] => {
  const [overflow, setOverflow] = useState(false)
  const [state, setState] = useState<OverflowState>('clear')
  const [result, setResult] = useState(overflow)
  const ref = useRef<T>()

  useEffect(() => {
    const element = ref.current
    const elementOverflows =
      !!element && (element.offsetHeight < element.scrollHeight || element.offsetWidth < element.scrollWidth)

    setOverflow(elementOverflows)
  }, [setOverflow])

  useEffect(() => {
    if (state === 'clear') {
      setState(overflow ? 'overflow' : 'clear')
      setResult(overflow)
    } else if (state === 'overflow' && !overflow) {
      setState('clear')
    }
  }, [overflow, state])

  return [result, ref]
}
