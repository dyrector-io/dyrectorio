import clsx from 'clsx'

interface DyoCardProps {
  className?: string
  children: React.ReactNode
}

export const DyoCard = (props: DyoCardProps) => {
  return (
    <div
      className={clsx(
        props.className,
        'card rounded-3xl shadow-lg bg-white max-w-md px-16 py-12',
      )}
    >
      {props.children}
    </div>
  )
}
