import { DyoInput, DyoInputProps } from '@app/elements/dyo-input'
import { editIdOf } from '@app/models'
import { CSSProperties } from 'react'
import { ItemEditorState } from './use-item-editor-state'
import useMultiInputState from './use-multi-input-state'

interface MultiInputProps extends Omit<DyoInputProps, 'id' | 'onFocus' | 'onBlur' | 'onChange'> {
  id: string
  disabled?: boolean
  editorOptions: ItemEditorState
  onPatch: (value: string) => void
}

const MultiInput = (props: MultiInputProps) => {
  const { id, disabled, editorOptions, style: propsStyle, value, onPatch, ...forwardedProps } = props

  const editId = editIdOf(id, editorOptions.itemId)

  const onMergeValues = (_: string, local: string) => {
    onPatch(local)
    return local
  }

  const [state, actions] = useMultiInputState({ id: editId, value, editorOptions, onMergeValues, disabled })

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
      disabled={disabled}
      value={state.value ?? ''}
      onFocus={actions.onFocus}
      onBlur={actions.onBlur}
      onChange={ev => onChange(ev.target.value)}
      style={style}
      {...forwardedProps}
    />
  )
}

export default MultiInput
