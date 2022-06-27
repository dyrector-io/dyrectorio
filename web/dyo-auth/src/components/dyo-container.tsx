import clsx from 'clsx'
import * as React from 'react'

export interface DyoContainerProps extends React.HTMLProps<HTMLDivElement> {
  component?: string
}

export function DyoContainer({
  component = 'div',
  className,
  children,
  ...props
}: DyoContainerProps) {
  return React.createElement(
    component,
    {
      ...props,
      className: clsx(
        'container mx-auto px-6 w-full max-w-2xl md:max-w-5xl lg:max-w-7xl',
        className,
      ),
    },
    children,
  )
}
