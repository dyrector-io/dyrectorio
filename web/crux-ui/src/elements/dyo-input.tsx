import clsx from 'clsx'
import React, { ForwardedRef, forwardRef } from 'react'
import { DyoLabel } from './dyo-label'
import { DyoMessage } from './dyo-message'

export interface DyoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  grow?: boolean
  label?: string
  message?: string
  messageType?: 'error' | 'info'
}

export const DyoInput = forwardRef((props: DyoInputProps, ref: ForwardedRef<HTMLInputElement>) => {
  const { label, message, messageType, grow, ...forwaredProps } = props

  return (
    <>
      {!label ? null : (
        <DyoLabel className="mt-8 mb-2.5" htmlFor={props.name}>
          {label}
        </DyoLabel>
      )}

      <input
        {...forwaredProps}
        ref={ref}
        className={clsx(
          props.className,
          'bg-medium h-11 p-4 ring-2 rounded-md focus:outline-none focus:dark',
          grow ? null : 'w-80',
          props.disabled ? 'text-bright-muted ring-light-grey-muted' : 'text-bright ring-light-grey',
        )}
      >
        {props.children}
      </input>

      {!message ? null : <DyoMessage message={message} messageType={messageType} />}
    </>
  )
})

DyoInput.displayName = 'DyoInput'
