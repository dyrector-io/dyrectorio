import { useRef } from 'react'

type SubmitFunc = () => Promise<void>

export type SubmitHook = {
  trigger: VoidFunction
  set: (target: SubmitFunc) => void
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

  const trigger = () => {
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
  }

  const set = (target: SubmitFunc) => {
    console.info('SET')
    stateRef.current.submit = target
    if (stateRef.current.submitWhenSet) {
      console.info('SET - TRIGGER')
      stateRef.current.submitWhenSet = false
      target
        ?.call(null)
        .then(() => console.info('submitted 2'))
        .catch(err => console.error(err))
    }
  }

  return {
    trigger,
    set,
  }
}

export default useSubmit
