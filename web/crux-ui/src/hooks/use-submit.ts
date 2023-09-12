import { useRef } from 'react'

export type SubmitHook = {
  trigger: VoidFunction
  set: (target: VoidFunction) => void
}

type State = {
  submit: VoidFunction
  submitWhenSet: boolean
}

const useSubmit = (): SubmitHook => {
  const stateRef = useRef<State>({
    submit: null,
    submitWhenSet: false,
  })

  const trigger = () => {
    if (stateRef.current.submit) {
      stateRef.current.submitWhenSet = false
      stateRef.current.submit()
      console.info('TRIGGER - SUBMIT')
    } else {
      stateRef.current.submitWhenSet = true
      console.info('TRIGGER - UNABLE')
    }
  }

  const set = (target: VoidFunction) => {
    console.info('SET')
    stateRef.current.submit = target
    if (stateRef.current.submitWhenSet) {
      console.info('SET - TRIGGER')
      stateRef.current.submitWhenSet = false
      target?.call(null)
    }
  }

  return {
    trigger,
    set,
  }
}

export default useSubmit
