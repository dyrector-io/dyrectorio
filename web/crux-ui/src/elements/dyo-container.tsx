import clsx from 'clsx'
import React from 'react'

export interface DyoContainerProps extends React.HTMLProps<HTMLDivElement> {
  component?: string
}

export const DyoContainer = ({ component = 'div', className, children, ...props }: DyoContainerProps) =>
  React.createElement(
    component,
    {
      ...props,
      className: clsx('container mx-auto px-6 w-full max-w-2xl md:max-w-5xl lg:max-w-7xl', className),
    },
    children,
  )
