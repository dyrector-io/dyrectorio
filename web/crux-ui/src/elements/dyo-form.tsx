import React from 'react'

export interface DyoFormProps extends Omit<React.TextareaHTMLAttributes<HTMLFormElement>, 'ref'> {}

const DyoForm = (props: DyoFormProps) => {
  const { onSubmit, onKeyDown, children, ...forwardedProps } = props

  const keydownHandler = e => {
    if ((e.key === 'Enter' && e.ctrlKey) || (e.key === 'Enter' && e.metaKey)) onSubmit(e)
    else onKeyDown?.call(e)
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <form onSubmit={onSubmit} onKeyDown={keydownHandler} {...forwardedProps}>
      {children}
    </form>
  )
}

export default DyoForm
