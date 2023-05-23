import clsx from 'clsx'
import Link from 'next/link'
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
  href?: string
  danger?: boolean
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
    href,
    disabled,
    children,
    type,
    danger,
    ...forwaredProps
  } = props

  const defaultColor = danger
    ? outlined
      ? 'ring-error-red'
      : 'bg-error-red'
    : secondary
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
  const cursor = disabled ? 'cursor-not-allowed' : 'cursor-pointer'

  const button = (
    <button
      {...forwaredProps}
      disabled={disabled}
      /* eslint-disable-next-line react/button-has-type */
      type={type ?? 'button'}
      className={clsx(
        className ?? 'mx-2 px-10',
        ring,
        border,
        color,
        textColor,
        font,
        rounded,
        cursor,
        heightClassName ?? 'h-10',
      )}
    >
      {children}
    </button>
  )

  return href ? (
    <Link className="inline-block" href={href}>
      {button}
    </Link>
  ) : (
    button
  )
}

export default DyoButton
