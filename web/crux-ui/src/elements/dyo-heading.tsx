import clsx from 'clsx'
import Link from 'next/link'
import React from 'react'

export interface DyoHeadingProps {
  element?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  className?: string
  children: React.ReactNode
  onClick?: () => void
  href?: string
}

export const DyoHeading = (props: DyoHeadingProps) => {
  const { element, className, children, onClick, href } = props

  return React.createElement(
    element ?? 'h1',
    {
      className: clsx(className ?? 'text-bright font-extrabold text-4xl', onClick ? 'cursor-pointer' : null),
      onClick,
    },
    href ? <Link href={href}>{children}</Link> : children,
  )
}
