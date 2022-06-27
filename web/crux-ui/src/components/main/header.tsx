import { DyoContainer } from '@app/elements/dyo-container'
import clsx from 'clsx'
import React from 'react'

export const Header = ({ children, className, ...props }: React.PropsWithChildren<React.HTMLProps<HTMLDivElement>>) => {
  return (
    <header className={clsx('font-poppins items-center flex py-6', className)} {...props}>
      <DyoContainer className="flex flex-row items-center justify-between h-full">{children}</DyoContainer>
    </header>
  )
}
