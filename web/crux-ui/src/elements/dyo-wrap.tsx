import clsx from 'clsx'

interface DyoWrapProps {
  key?: React.Key
  className?: string
  itemClassName?: string
  children: React.ReactNode[]
}

export const dyoWrapItemClassName = (cols: number, className?: string) => (index: number) => {
  const modulo = index % cols
  return clsx(className, modulo < 1 ? 'lg:pr-2' : modulo >= cols ? 'lg:pl-2' : 'lg:px-2')
}

const DyoWrap = (props: DyoWrapProps) => {
  const { className, children, itemClassName } = props

  const key = props.key ?? 'dyo-wrap'

  return (
    <>
      <div className={clsx('flex flex-wrap', className ?? 'mt-2 mb-4')}>
        {children.map((it, index) => (
          <div
            key={`${key}-item-${index}`}
            className={clsx('flex w-full', itemClassName ?? ['lg:w-1/2 py-2', index % 2 ? 'lg:pl-2' : 'lg:pr-2'])}
          >
            {it}
          </div>
        ))}
      </div>
    </>
  )
}

export default DyoWrap
