import clsx from 'clsx'
import { RefAttributes } from 'react'

export interface DyoCardProps extends RefAttributes<HTMLDivElement> {
  className?: string
  children: React.ReactNode
  modal?: boolean
}

export const DyoCard = (props: DyoCardProps) => {
  return (
    <div
      className={clsx(
        props.className ?? 'p-8',
        'card rounded-lg bg-medium',
        props.modal ? 'shadow-modal' : 'shadow-lg',
      )}
    >
      {props.children}
    </div>
  )
}
