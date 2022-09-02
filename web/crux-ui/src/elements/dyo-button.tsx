/* eslint-disable react/button-has-type */
import clsx from 'clsx'
import React from 'react'

export interface DyoButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'ref'> {
  heightClassName?: string
  secondary?: boolean
  outlined?: boolean
  underlined?: boolean
  thin?: boolean
  text?: boolean
  color?: string
  textColor?: string
}

const DyoButton = (props: DyoButtonProps) => {
  const {
    secondary,
    outlined,
    underlined,
    text,
    thin,
    className,
    heightClassName,
    color: colorClassName,
    textColor: textColorClassName,
    disabled,
    children,
    type,
    ...forwaredProps
  } = props

  const defaultColor = secondary
    ? outlined
      ? 'ring-warning-orange'
      : 'bg-warning-orange'
    : outlined
    ? 'ring-dyo-turquoise'
    : 'bg-dyo-turquoise'
  const disabledColor = outlined ? 'ring-light-grey-muted' : 'bg-light-grey-muted'

  const color = text ? 'bg-transparent' : disabled ? disabledColor : colorClassName ?? defaultColor

  const defaultTextColor = text || outlined ? (secondary ? 'text-warning-orange' : 'text-dyo-turquoise') : 'text-white'

  const textColor = disabled ? 'text-light' : textColorClassName ?? defaultTextColor

  const ring = outlined && !text ? 'ring-2' : null
  const border = underlined ? 'border-b-2 border-dyo-turquoise' : null
  const rounded = !underlined ? 'rounded' : null
  const font = !thin && (text || !outlined) ? 'font-semibold' : null

  return (
    <button
      {...forwaredProps}
      type={type ?? 'button'}
      className={clsx(
        className ?? 'mx-2 px-10',
        ring,
        border,
        color,
        textColor,
        font,
        rounded,
        heightClassName ?? 'h-10',
      )}
    >
      {children}
    </button>
  )
}

export default DyoButton
