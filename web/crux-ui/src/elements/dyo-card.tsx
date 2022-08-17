import clsx from 'clsx'
import { RefAttributes } from 'react'

export interface DyoCardProps extends RefAttributes<HTMLDivElement> {
  className?: string
  children: React.ReactNode
  modal?: boolean
}

export const DyoCard = (props: DyoCardProps) => {
  const boxShadow = props.modal ? 'shadow-modal' : 'shadow-lg'

  return <div className={clsx(props.className ?? 'p-8', 'card rounded-lg bg-medium', boxShadow)}>{props.children}</div>
}
