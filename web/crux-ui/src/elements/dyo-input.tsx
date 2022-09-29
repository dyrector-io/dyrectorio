import clsx from 'clsx'
import React, { ForwardedRef, forwardRef } from 'react'
import { DyoLabel } from './dyo-label'
import DyoMessage from './dyo-message'

export interface DyoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  grow?: boolean
  label?: string
  labelClassName?: string
  containerClassName?: string
  message?: string
  messageType?: 'error' | 'info'
  inline?: boolean
}

export const DyoInput = forwardRef((props: DyoInputProps, ref: ForwardedRef<HTMLInputElement>) => {
  const {
    label,
    labelClassName,
    message,
    messageType,
    grow,
    name,
    className,
    containerClassName,
    disabled,
    inline,
    ...forwardedProps
  } = props

  return (
    <div className={clsx(containerClassName, inline ? 'flex flex-row' : 'flex flex-col')}>
      {!label ? null : (
        <DyoLabel
          className={clsx(labelClassName ?? (inline ? 'my-auto mr-4' : 'mt-8 mb-2.5'), 'whitespace-nowrap')}
          htmlFor={name}
        >
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
          grow ? 'w-full' : 'w-80',
          disabled ? 'text-bright-muted ring-light-grey-muted' : 'text-bright ring-light-grey',
        )}
      />

      {!message ? null : <DyoMessage message={message} messageType={messageType} />}
    </div>
  )
})

DyoInput.displayName = 'DyoInput'
