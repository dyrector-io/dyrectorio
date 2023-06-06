import clsx from 'clsx'

interface DyoTagProps {
  className?: string
  textColor?: string
  color?: string
  solid?: boolean
  children: React.ReactNode
}

const DyoTag = (props: DyoTagProps) => {
  const { className, textColor: propsTextColor, color: propsColor, solid, children } = props

  const color = propsColor ?? ''
  const textColor = propsTextColor ?? ''

  return (
    <span
      className={clsx(
        className,
        color,
        textColor,
        !solid && 'bg-opacity-10',
        'rounded-full bg-opacity-10 text-xs font-semibold h-fit px-8 py-0.5',
      )}
    >
      {children}
    </span>
  )
}

export default DyoTag
