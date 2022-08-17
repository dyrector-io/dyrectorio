import clsx from 'clsx'
import { RefAttributes } from 'react'

export interface DyoCardProps extends RefAttributes<HTMLDivElement> {
  className?: string
  children: React.ReactNode
  modal?: boolean
}

export const DyoCard = (props: DyoCardProps) => {
  let modalBoxShadow
  if (props.modal) {
    modalBoxShadow = props.modal
  } {
    modalBoxShadow = 'shadow-lg'
  }

  return (
    <div
      className={clsx(props.className ?? 'p-8', 'card rounded-lg bg-medium', modalBoxShadow)}
    >
      {props.children}
    </div>
  )
}
