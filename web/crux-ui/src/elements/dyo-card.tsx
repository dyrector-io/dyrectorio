import clsx from 'clsx'
import { RefAttributes } from 'react'

export interface DyoCardProps extends RefAttributes<HTMLDivElement> {
  className?: string
  children: React.ReactNode
  modal?: boolean
}

export const DyoCard = (props: DyoCardProps) => {
  const { className, modal, children } = props

  return (
    <div className={clsx(className ?? 'p-8', 'card rounded-lg bg-medium', modal ? 'shadow-modal' : 'shadow-lg')}>
      {children}
    </div>
  )
}
