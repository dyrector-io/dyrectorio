import { Editor, initialsOf } from '@app/models'
import clsx from 'clsx'
import { CSSProperties } from 'react'

export type EditorBadgeProps = {
  className?: string
  editor: Editor
}

const EditorBadge = (props: EditorBadgeProps) => {
  const { editor, className } = props

  const style: CSSProperties = {
    width: 38,
    height: 38,
    background: editor.color,
  }

  return (
    <span
      className={clsx('flex justify-center items-center rounded-full font-bold text-dark text-xl', className)}
      style={style}
    >
      {initialsOf(editor.name)}
    </span>
  )
}

export default EditorBadge
