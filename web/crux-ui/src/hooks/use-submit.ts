import { useCallback, useRef, useState } from 'react'

type SubmitFunc = () => Promise<any>

export type SubmitHook = {
  disabled: boolean
  trigger: SubmitFunc
  set: (target: SubmitFunc, submit: boolean) => Promise<void>
}

type State = {
  submit: SubmitFunc
  submitWhenSet: boolean
}

const useSubmit = (): SubmitHook => {
  const stateRef = useRef<State>({
    submit: null,
    submitWhenSet: false,
  })

  const [disabled, setDisabled] = useState(false)

  const trigger = useCallback(async () => {
    if (stateRef.current.submit) {
      stateRef.current.submitWhenSet = false
      await stateRef.current.submit()
    } else {
      stateRef.current.submitWhenSet = true
    }
  }, [])

  const set = useCallback(async (target: SubmitFunc, submitting: boolean) => {
    setDisabled(submitting)

    stateRef.current.submit = target
    if (stateRef.current.submitWhenSet) {
      if (target) {
        stateRef.current.submitWhenSet = false
        await target()
      }
    }
  }, [])

  return {
    trigger,
    set,
    disabled,
  }
}

export default useSubmit
