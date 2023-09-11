import { useRef } from 'react'

export type SubmitHook = {
  submit: VoidFunction
  set: (target: VoidFunction) => void
}

const useSubmit = (): SubmitHook => {
  const submitRef = useRef<VoidFunction>(null)
  const submitIfSet = useRef<boolean>(false)

  const submit = () => {
    if (submitRef.current) {
      submitIfSet.current = false
      submitRef.current()
    } else {
      submitIfSet.current = true
    }
  }

  const set = (target: VoidFunction) => {
    submitRef.current = target
    if (submitIfSet.current) {
      submitIfSet.current = false
      target()
    }
  }

  return {
    submit,
    set,
  }
}

export default useSubmit
