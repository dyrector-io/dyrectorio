import clsx from 'clsx'
import React, { ForwardedRef, forwardRef, useState} from 'react'
import { DyoLabel } from './dyo-label'
import DyoMessage from './dyo-message'
import {DyoPassword} from './dyo-password'

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
    ...forwardedProps
  } = props


  const [ isVisible, setVisible ] = useState(false)
  
  const changePasswordVisibility = () => {
    setVisible((prevData) => !prevData)
  }

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
        {forwardedProps.type === 'password' ? 
        <div 
          className={clsx(
            className,
            'h-11 ring-2 rounded-md ring-light-grey flex flex-row items-center',
            grow && 'w-full',
          )}
        >
          <input
            {...forwardedProps}
            name={name}
            ref={ref}
            type={isVisible ? 'text' : 'password'}
            disabled={disabled}
            hidden={hidden}
            id={id ?? name}
            className={clsx('bg-medium h-full p-4 w-[93%] rounded-md focus:outline-none focus:dark text-bright')}
          />
          {forwardedProps.value.toString().trim() !== '' ? 
            <DyoPassword isVisible={isVisible} onClick={changePasswordVisibility} /> : null
          }
        </div> :  
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
        />}
      </div>
        {!hidden && message && !inline ? (
          <DyoMessage message={message} messageType={messageType} className="text-xs italic" />
        ) : null}
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
