import clsx from 'clsx'
import { DyoContainer } from './dyo-container'

export function Header({
  children,
  className,
  ...props
}: React.PropsWithChildren<React.HTMLProps<HTMLDivElement>>) {
  return (
    <header
      className={clsx('font-poppins items-center flex py-6', className)}
      {...props}
    >
      <DyoContainer className="flex flex-row items-center justify-between">
        {children}
      </DyoContainer>
    </header>
  )
}
