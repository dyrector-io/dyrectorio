import clsx from 'clsx'
import React from 'react'
import { DyoLabel } from './dyo-label'
import { DyoMessage } from './dyo-message'

export interface DyoInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'ref'> {
  grow?: boolean
  label?: string
  message?: string
  messageType?: 'error' | 'info'
}

export class DyoInput extends React.Component<DyoInputProps> {
  constructor(props: DyoInputProps) {
    super(props)
  }

  render() {
    const { label, message, messageType, grow, ...forwaredProps } = this.props

    return (
      <>
        {!label ? null : (
          <DyoLabel className="mt-8 mb-2.5" htmlFor={this.props.name}>
            {label}
          </DyoLabel>
        )}

        <input
          {...forwaredProps}
          className={clsx(
            this.props.className,
            'bg-medium h-11 p-4 ring-2 rounded-md text-bright ring-light-grey focus:outline-none focus:dark',
            grow ? null : 'w-80',
          )}
        >
          {this.props.children}
        </input>

        {!message ? null : <DyoMessage message={message} messageType={messageType} />}
      </>
    )
  }
}
