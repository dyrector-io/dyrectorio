import clsx from 'clsx'
import React from 'react'

export interface DyoButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'ref'> {
  secondary?: boolean
}

export class DyoButton extends React.Component<DyoButtonProps> {
  constructor(props: DyoButtonProps) {
    super(props)
  }

  render() {
    const { secondary, ...forwaredProps } = this.props
    const disabled = this.props.disabled
    const color = secondary
      ? disabled
        ? 'ring-dyo-eased-purple-pale'
        : 'ring-dyo-purple'
      : disabled
      ? 'bg-dyo-eased-purple-pale'
      : 'bg-dyo-purple'
    const textColor = secondary
      ? 'text-dyo-shadowed-purple'
      : disabled
      ? 'text-dyo-shadowed-purple'
      : 'text-white'

    const classes = !secondary
      ? 'font-semibold rounded-full h-12'
      : 'ring-2 font-semibold rounded-full h-12'

    return (
      <button
        {...forwaredProps}
        className={clsx(
          this.props.className ?? 'mx-4 px-4',
          classes,
          color,
          textColor,
        )}
      >
        {this.props.children}
      </button>
    )
  }
}
