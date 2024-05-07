import clsx from 'clsx'

interface DyoIndicatorProps {
  color: string
  className?: string
  title?: string
}

const DyoIndicator = (props: DyoIndicatorProps) => {
  const { className, color, title } = props

  return <div className={clsx('w-4 h-4 rounded-full aspect-square', color, className)} title={title} />
}

export default DyoIndicator
