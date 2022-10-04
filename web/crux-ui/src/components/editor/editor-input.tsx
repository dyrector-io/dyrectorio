import { DyoInput, DyoInputProps } from '@app/elements/dyo-input'
import { CSSProperties } from 'react'
import useEditorState, { EditorOptions } from './use-editor-state'

interface EditorInputProps extends Omit<DyoInputProps, 'id' | 'onFocus' | 'onBlur'> {
  id: string
  disabled?: boolean
  options: EditorOptions
}

const EditorInput = (props: EditorInputProps) => {
  const { id, disabled, options, style: propsStyle, ...forwaredProps } = props

  const [state, actions] = useEditorState(id, options, disabled)

  const { highlightColor, focused } = state

  const style: CSSProperties =
    highlightColor && focused
      ? {
          outline: 'solid',
          outlineColor: highlightColor,
        }
      : propsStyle

  return <DyoInput id={id} onFocus={actions.onFocus} onBlur={actions.onBlur} style={style} {...forwaredProps} />
}

export default EditorInput
