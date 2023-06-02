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
    <div
      className={clsx(
        className,
        color,
        textColor,
        !solid && 'bg-opacity-10',
        'bg-dyo-turquoise text-dyo-turquoise rounded-full bg-opacity-10 text-xs font-semibold px-8 py-0.5 mt-auto',
      )}
    >
      {children}
    </div>
  )
}

export default DyoTag
