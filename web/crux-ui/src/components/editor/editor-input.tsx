import { DyoInput, DyoInputProps } from '@app/elements/dyo-input'
import { CSSProperties } from 'react'
import useEditorState, { EditorOptions } from './use-editor-state'

interface EditorInputProps extends Omit<DyoInputProps, 'id' | 'onFocus' | 'onBlur' | 'onChange'> {
  id: string
  disabled?: boolean
  options: EditorOptions
  onPatch: (value: string) => void
}

const EditorInput = (props: EditorInputProps) => {
  const { id, disabled, options, style: propsStyle, value, onPatch, ...forwaredProps } = props

  const onMergeValues = (_: string, local: string) => {
    onPatch(local)
    return local
  }

  const [state, actions] = useEditorState(id, value, options, onMergeValues, disabled)

  const onChange = (newValue: string) => {
    actions.onChange(newValue)
    onPatch(newValue)
  }

  const { highlightColor } = state

  const style: CSSProperties = highlightColor
    ? {
        outline: 'solid',
        outlineColor: highlightColor,
      }
    : propsStyle

  return (
    <DyoInput
      id={id}
      value={state.value}
      onFocus={actions.onFocus}
      onBlur={actions.onBlur}
      onChange={ev => onChange(ev.target.value)}
      style={style}
      {...forwaredProps}
    />
  )
}

export default EditorInput
