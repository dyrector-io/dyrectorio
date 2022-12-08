import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import React, { ForwardedRef, forwardRef } from 'react'
import DyoMessage from './dyo-message'

export interface DyoSelectProps extends React.InputHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode
  className?: string
  disabled?: boolean
  grow?: boolean
  message?: string
  messageType?: 'error' | 'info'
}

export const DyoSelect = forwardRef((props: DyoSelectProps, ref: ForwardedRef<HTMLSelectElement>) => {
  const { t } = useTranslation('common')
  const { message, messageType, grow, ...forwaredProps } = props

  return (
    <>
      <div className={clsx(props.className, 'relative', grow ? null : 'w-80')}>
        <select
          {...forwaredProps}
          ref={ref}
          className={clsx(
            'w-full cursor-pointer appearance-none bg-medium h-11 pl-4 p-2 ring-2 rounded-md focus:outline-none focus:dark',
            props.disabled ? 'text-bright-muted ring-light-grey-muted' : 'text-bright ring-light-grey',
          )}
        />
        <div className="pointer-events-none pr-2 absolute h-[24px] right-0 top-1/2 transform -translate-y-1/2">
          <Image src="/chevron_down.svg" alt={t('common:down')} aria-hidden width={24} height={24} />
        </div>
      </div>

      {!message ? null : <DyoMessage message={message} messageType={messageType} />}
    </>
  )
})

DyoSelect.displayName = 'DyoSelect'
DyoSelect.defaultProps = {
  className: null,
  disabled: false,
  grow: false,
  message: null,
  messageType: 'error',
}
