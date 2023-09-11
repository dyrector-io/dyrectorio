import { useRef, useState } from 'react'

export type SubmitHook = {
  trigger: VoidFunction
  set: (target: VoidFunction) => void
}

const useSubmit = (): SubmitHook => {
  const [targetFunc, setTargetFunc] = useState<VoidFunction>(null)
  const submitWhenSet = useRef<boolean>(false)

  const trigger = () => {
    if (targetFunc) {
      submitWhenSet.current = false
      targetFunc()
    } else {
      submitWhenSet.current = true
    }
  }

  const set = (target: VoidFunction) => {
    setTargetFunc(target)
    if (submitWhenSet.current) {
      submitWhenSet.current = false
      target()
    }
  }

  return {
    trigger,
    set,
  }
}

export default useSubmit
