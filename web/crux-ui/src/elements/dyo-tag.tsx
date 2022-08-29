import clsx from 'clsx'

interface DyoTagProps {
  className?: string
  textColor?: string
  color?: string
  solid?: boolean
  children: React.ReactNode
}

const DyoTag = (props: DyoTagProps) => {
  const color = props.color ?? 'bg-dyo-turquoise'
  const textColor = props.textColor ?? 'text-dyo-turquoise'

  return (
    <>
      <div
        className={clsx(
          props.className,
          color,
          textColor,
          !props.solid && 'bg-opacity-10',
          'rounded-full bg-opacity-10 text-xs font-semibold px-8 py-0.5 mt-auto',
        )}
      >
        {props.children}
      </div>
    </>
  )
}

export default DyoTag
