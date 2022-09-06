import clsx from 'clsx'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-json'
import 'prismjs/themes/prism-tomorrow.css'
import { useEffect, useReducer } from 'react'
import Editor from 'react-simple-code-editor'

const tryParseJson = (text: string): object => {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
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

interface JsonEditorProps<T> {
  className?: string
  disabled?: boolean
  value?: T
  onChange?: (value?: T) => void
  onParseError?: (err: Error) => void
}

const JsonEditorInternal = <T,>(props: JsonEditorProps<T>) => {
  const { className, disabled, value, onChange: propOnChange, onParseError } = props

  const [state, dispatch] = useReducer(reducer, JSON.stringify(value, undefined, '  '))

  useEffect(() => {
    dispatch({
      type: 'update',
      content: JSON.stringify(value, undefined, '  '),
    })
  }, [value])

  const onChange = (text: string) => {
    dispatch({
      type: 'text-changed',
      content: text,
    })

    try {
      const json = JSON.parse(text)
      propOnChange?.call(null, json)
    } catch (e) {
      const err = e as Error
      onParseError?.call(null, err)
    }
  }

  return (
    <div
      className={clsx('text-bright bg-gray-900 rounded-md ring-2 ring-light-grey border-dark caret-white', className)}
    >
      <Editor
        textareaClassName="outline-none"
        disabled={disabled}
        padding={2}
        tabSize={2}
        insertSpaces
        value={state}
        onValueChange={onChange}
        highlight={newValue => highlight(newValue, languages.json, 'json')}
      />
    </div>
  )
}

export default JsonEditorInternal

type JsonEditorActionType = 'update' | 'text-changed'

type JsonEditorAction = {
  type: JsonEditorActionType
  content: string
}
