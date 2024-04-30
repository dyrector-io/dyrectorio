import clsx from 'clsx'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-yaml'
import 'prismjs/themes/prism-tomorrow.css'
import { useRef, useState } from 'react'
import Editor from 'react-simple-code-editor'

type YamlEditorProps = {
  className?: string
  readOnly?: boolean
  initialValue?: string
  onChange: (value: string) => void
}

const YamlEditor = (props: YamlEditorProps) => {
  const { className, readOnly, initialValue, onChange: propsOnChange } = props

  const [state, setState] = useState(initialValue ?? '')
  const ref = useRef()

  const onChange = (text: string) => {
    setState(text)
    propsOnChange(text)
  }

  return (
    <div
      className={clsx('bg-gray-900 rounded-md ring-2 ring-light-grey border-dark caret-white text-blue-300', className)}
    >
      <Editor
        ref={ref}
        readOnly={readOnly}
        padding={2}
        tabSize={2}
        insertSpaces
        value={state}
        onValueChange={onChange}
        highlight={newValue => highlight(newValue, languages.yaml, 'yaml')}
      />
    </div>
  )
}

export default YamlEditor
