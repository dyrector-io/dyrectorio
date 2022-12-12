import clsx from 'clsx'
import React from 'react'
import { DyoLabel } from './dyo-label'
import DyoMessage from './dyo-message'

export interface DyoTextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'ref'> {
  grow?: boolean
  label?: string
  message?: string
  messageType?: 'error' | 'info'
}

const DyoTextArea = (props: DyoTextAreaProps) => {
  const { label, message, messageType, grow, name, className, children, ...forwardedProps } = props

  return (
    <>
      {!label ? null : (
        <DyoLabel className="mt-8 mb-2.5" htmlFor={name}>
          {label}
        </DyoLabel>
      )}

      <textarea
        {...forwardedProps}
        name={name}
        id={name}
        className={clsx(
          className,
          'bg-medium p-4 ring-2 rounded-md text-bright ring-light-grey focus:outline-none focus:dark',
          grow ? null : 'w-80',
        )}
      >
        {children}
      </textarea>

      {!message ? null : <DyoMessage message={message} messageType={messageType} />}
    </>
  )
}

export default DyoTextArea
