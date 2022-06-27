import clsx from 'clsx'
import React from 'react'
import { DyoLabel } from './dyo-label'
import { DyoMessage } from './dyo-message'

export interface DyoTextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'ref'> {
  grow?: boolean
  label?: string
  message?: string
  messageType?: 'error' | 'info'
}

export class DyoTextArea extends React.Component<DyoTextAreaProps> {
  constructor(props: DyoTextAreaProps) {
    super(props)
  }

  render() {
    const { label, message, messageType, grow, ...forwaredProps } = this.props

    {
      !label ? null : (
        <DyoLabel className="mt-8 mb-2.5" htmlFor={this.props.name}>
          {label}
        </DyoLabel>
      )
    }

    return (
      <>
        {!label ? null : (
          <DyoLabel className="mt-8 mb-2.5" htmlFor={this.props.name}>
            {label}
          </DyoLabel>
        )}

        <textarea
          {...forwaredProps}
          className={clsx(
            this.props.className,
            'bg-medium p-4 ring-2 rounded-md text-bright ring-light-grey focus:outline-none focus:dark',
            grow ? null : 'w-80',
          )}
        >
          {this.props.children}
        </textarea>

        {!message ? null : <DyoMessage message={message} messageType={messageType} />}
      </>
    )
  }
}
