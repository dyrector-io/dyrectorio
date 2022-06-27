import clsx from 'clsx'
import React from 'react'

interface DyoHeadingProps {
  element?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

export const DyoHeading = (props: DyoHeadingProps) => {
  const { element, className, children, onClick } = props

  return React.createElement(
    element ?? 'h1',
    {
      className: clsx(className ?? 'text-bright font-extrabold text-4xl', onClick ? 'cursor-pointer' : null),
      onClick,
    },
    children,
  )
}
