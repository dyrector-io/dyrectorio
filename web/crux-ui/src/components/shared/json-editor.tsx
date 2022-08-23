import clsx from 'clsx'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-json'
import 'prismjs/themes/prism-tomorrow.css'
import { useEffect, useReducer } from 'react'
import Editor from 'react-simple-code-editor'

interface JsonEditorProps<T> {
  className?: string
  disabled?: boolean
  value?: T
  onChange?: (value?: T) => void
  onParseError?: (err: Error) => void
}

const _JsonEditor = <T,>(props: JsonEditorProps<T>) => {
  const [state, dispatch] = useReducer(reducer, JSON.stringify(props.value, undefined, '  '))

  useEffect(() => {
    dispatch({
      type: 'update',
      content: JSON.stringify(props.value, undefined, '  '),
    })
  }, [props.value])

  const onChange = (text: string) => {
    dispatch({
      type: 'text-changed',
      content: text,
    })

    try {
      const json = JSON.parse(text)
      props.onChange?.call(null, json)
    } catch (e) {
      const err = e as Error
      props.onParseError?.call(null, err)
    }
  }

  return (
    <div className={clsx('bg-gray-900 rounded-md ring-2 ring-light-grey border-dark', props.className)}>
      <Editor
        disabled={props.disabled}
        padding={2}
        tabSize={2}
        insertSpaces
        value={state}
        onValueChange={onChange}
        highlight={value => highlight(value, languages['json'], 'json')}
      />
    </div>
  )
}

export default _JsonEditor

type JsonEditorActionType = 'update' | 'text-changed'

type JsonEditorAction = {
  type: JsonEditorActionType
  content: string
}

const reducer = (state: string, action: JsonEditorAction): string => {
  const { type, content } = action

  if (type === 'text-changed') {
    return content
  }

  const stateJson = tryParseJson(state)
  const contentJson = tryParseJson(content)

  if (!stateJson || !contentJson) {
    return state !== content ? content.trim() : state
  }

  return JSON.stringify(stateJson) !== JSON.stringify(contentJson) ? content : state
}

const tryParseJson = (text: string): object => {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}
