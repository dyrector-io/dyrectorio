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
  onChange?: (value?: string) => void
}

const ShEditor = (props: ShEditorProps) => {
  const [state, setState] = useState(props.value)

  const onChange = (text: string) => {
    setState(text)
  }

  return (
    <div
      className={clsx(
        'bg-gray-900 rounded-md ring-2 ring-light-grey border-dark caret-white text-blue-300',
        props.className,
      )}
    >
      <Editor
        readOnly={props.readOnly}
        padding={2}
        tabSize={2}
        insertSpaces
        value={state}
        onValueChange={onChange}
        highlight={value => highlight(value, languages['shell'], 'shell')}
      />
    </div>
  )
}

export default ShEditor
