import clsx from 'clsx'
import { RefAttributes } from 'react'

export interface DyoCardProps extends RefAttributes<HTMLDivElement> {
  className?: string
  children: React.ReactNode
}

export const DyoCard = (props: DyoCardProps) => {
  return <div className={clsx(props.className ?? 'p-8', 'card rounded-lg shadow-lg bg-medium')}>{props.children}</div>
}
