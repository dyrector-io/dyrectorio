import clsx from 'clsx'
import { HTMLAttributes } from 'react'

export interface DyoCardProps extends HTMLAttributes<HTMLDivElement> {
  shadowClassName?: string
}

export const DyoCard = (props: DyoCardProps) => {
  const { className, shadowClassName, children, ...forwardedProps } = props

  return (
    <div
      className={clsx(className ?? 'p-8', 'card rounded-lg bg-medium', shadowClassName ?? 'shadow-lg')}
      {...forwardedProps}
    >
      {children}
    </div>
  )
}
