import { useCallback, useRef, useState } from 'react'

type SubmitFunc = () => Promise<any>

export type SubmitHook = {
  disabled: boolean
  trigger: VoidFunction
  set: (target: SubmitFunc, submit: boolean) => void
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

  const trigger = useCallback(() => {
    if (stateRef.current.submit) {
      stateRef.current.submitWhenSet = false
      console.info('TRIGGER - SUBMIT')
      stateRef.current
        .submit()
        .then(() => console.info('submitted'))
        .catch(err => console.error(err))
    } else {
      stateRef.current.submitWhenSet = true
      console.info('TRIGGER - UNABLE')
    }
  }, [])

  const set = useCallback((target: SubmitFunc, submitting: boolean) => {
    console.info('SET - overwrite:', !!stateRef.current.submit, 'disabled?', submitting)

    console.info()
    setDisabled(submitting)

    stateRef.current.submit = target
    if (stateRef.current.submitWhenSet) {
      console.info('SET - TRIGGER')
      stateRef.current.submitWhenSet = false
      target
        ?.call(null)
        .then(() => console.info('submitted 2'))
        .catch(err => console.error(err))
    }
  }, [])

  return {
    trigger,
    set,
    disabled,
  }
}

export default useSubmit
