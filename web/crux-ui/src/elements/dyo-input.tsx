import clsx from 'clsx'
import React, { ForwardedRef, forwardRef } from 'react'
import { DyoLabel } from './dyo-label'
import DyoMessage from './dyo-message'

export type MessageType = 'error' | 'info'
export interface DyoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  grow?: boolean
  label?: string
  labelClassName?: string
  message?: string
  messageType?: MessageType
}

export const DyoInput = forwardRef((props: DyoInputProps, ref: ForwardedRef<HTMLInputElement>) => {
  const { label, labelClassName, message, messageType, grow, name, className, disabled, ...forwardedProps } = props

  return (
    <>
      {!label ? null : (
        <DyoLabel className={clsx(labelClassName ?? 'mt-8 mb-2.5')} htmlFor={name}>
          {label}
        </DyoLabel>
      )}

      <input
        {...forwardedProps}
        name={name}
        ref={ref}
        disabled={disabled}
        className={clsx(
          className,
          'bg-medium h-11 p-4 ring-2 rounded-md focus:outline-none focus:dark',
          grow ? null : 'w-80',
          disabled ? 'text-bright-muted ring-light-grey-muted' : 'text-bright ring-light-grey',
        )}
      />

      {!message ? null : <DyoMessage message={message} messageType={messageType} />}
    </>
  )
})

DyoInput.displayName = 'DyoInput'
