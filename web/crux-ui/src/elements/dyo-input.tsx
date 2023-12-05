import clsx from 'clsx'
import React, { ForwardedRef, forwardRef } from 'react'
import { DyoLabel } from './dyo-label'
import DyoMessage from './dyo-message'

export type MessageType = 'error' | 'info'
export interface DyoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  grow?: boolean
  label?: string
  labelClassName?: string
  containerClassName?: string
  message?: string
  messageType?: MessageType
  invalid?: boolean
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
    hidden,
    id,
    invalid,
    children,
    ...forwardedProps
  } = props

  const error = (message && messageType === 'error') || invalid

  return (
    <>
      <div className={clsx(containerClassName, inline ? `flex flex-row ${message ? 'mb-0' : ''}` : 'flex flex-col')}>
        {!label || hidden ? null : (
          <DyoLabel
            className={clsx(labelClassName ?? (inline ? 'my-auto mr-4' : 'mt-8 mb-2.5'), 'whitespace-nowrap')}
            htmlFor={id ?? name}
          >
            {label}
          </DyoLabel>
        )}

        <span className={clsx('relative', className, grow ? 'w-full' : 'w-80')}>
          <input
            {...forwardedProps}
            name={name}
            ref={ref}
            disabled={disabled}
            hidden={hidden}
            id={id ?? name}
            className={clsx(
              className,
              'bg-medium h-11 p-4 ring-2 rounded-md focus:outline-none focus:dark',
              grow ? 'w-full' : 'w-80',
              disabled
                ? 'text-bright-muted ring-light-grey-muted cursor-not-allowed'
                : error
                ? 'text-bright ring-error-red'
                : 'text-bright ring-light-grey',
            )}
          />

          {children}
        </span>

        {!hidden && message && !inline ? (
          <DyoMessage message={message} messageType={messageType} className="text-xs italic" />
        ) : null}
      </div>

      {!hidden && message && inline ? (
        <DyoMessage message={message} messageType={messageType} marginClassName="my-2" className="text-xs italic" />
      ) : null}
    </>
  )
})

DyoInput.displayName = 'DyoInput'
DyoInput.defaultProps = {
  grow: false,
  label: null,
  labelClassName: null,
  containerClassName: null,
  message: null,
  messageType: 'error',
  invalid: false,
  inline: false,
}
