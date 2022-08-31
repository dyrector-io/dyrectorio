import clsx from 'clsx'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-bash'
import 'prismjs/themes/prism-tomorrow.css'
import { useState } from 'react'
import Editor from 'react-simple-code-editor'

interface ShEditorProps {
  className?: string
  readOnly?: boolean
  value?: string
}

const ShEditor = (props: ShEditorProps) => {
  const { className, readOnly, value } = props

  const [state, setState] = useState(value)

  const onChange = (text: string) => {
    setState(text)
  }

  return (
    <div
      className={clsx('bg-gray-900 rounded-md ring-2 ring-light-grey border-dark caret-white text-blue-300', className)}
    >
      <Editor
        readOnly={readOnly}
        padding={2}
        tabSize={2}
        insertSpaces
        value={state}
        onValueChange={onChange}
        highlight={valueArg => highlight(valueArg, languages.shell, 'shell')}
      />
    </div>
  )
}

export default ShEditor
