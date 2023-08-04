import DyoButton from '@app/elements/dyo-button'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import React, { useCallback, useEffect, useRef } from 'react'
import { DyoCard } from './dyo-card'
import { DyoHeading } from './dyo-heading'

export interface DyoModalProps {
  className?: string
  titleClassName?: string
  descClassName?: string
  title: string
  description?: string
  buttons?: React.ReactNode
  children?: React.ReactNode
  open: boolean
  onClose: VoidFunction
}

const DyoModal = (props: DyoModalProps) => {
  const {
    className,
    titleClassName,
    descClassName,
    title,
    description,
    buttons: propsButtons,
    children,
    open,
    onClose,
  } = props

  const { t } = useTranslation('common')

  const buttons = propsButtons ?? <DyoButton onClick={onClose}>{t('close')}</DyoButton>

  const onCloseRef = useRef(onClose)

  const onKeyDown = useCallback((ev: KeyboardEvent) => {
    if (ev.key === 'Escape') {
      onCloseRef.current()
    }
  }, [])

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', onKeyDown)
    } else {
      document.removeEventListener('keydown', onKeyDown)
    }

    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onKeyDown])

  return (
    open && (
      <div className="flex fixed inset-0 bg-light-grey bg-opacity-50 h-screen w-screen">
        <DyoCard className={clsx(className, 'flex flex-col m-auto p-8')} modal>
          <DyoHeading element="h4" className={titleClassName ?? 'text-xl font-bold text-bright'}>
            {title}
          </DyoHeading>

          {description && <p className={descClassName}>{description}</p>}

          {children}

          <div className="mx-auto mt-auto pt-8">{buttons}</div>
        </DyoCard>
      </div>
    )
  )
}

export default DyoModal

export type DyoConfirmationModalConfig = {
  onClose: (confirmed: boolean) => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  confirmColor?: string
  cancelColor?: string
}

export type DyoConfirmationModalProps = Omit<DyoModalProps, 'buttons' | 'children' | 'onClose' | 'open' | 'title'> & {
  config: DyoConfirmationModalConfig
}

export const DyoConfirmationModal = (props: DyoConfirmationModalProps) => {
  const { description, config, className, ...forwardedProps } = props

  const { t } = useTranslation('common')

  if (!config) {
    return null
  }

  const { onClose } = config

  const actualDescription = config.description ?? description

  return (
    <DyoModal
      {...forwardedProps}
      className={clsx(className, 'min-w-[450px]')}
      title={config?.title}
      open
      onClose={() => onClose(false)}
      buttons={
        <>
          <DyoButton color={config.confirmColor} onClick={() => onClose(true)}>
            {config.confirmText ?? t('confirm')}
          </DyoButton>

          <DyoButton color={config.cancelColor} onClick={() => onClose(false)}>
            {config.cancelText ?? t('cancel')}
          </DyoButton>
        </>
      }
    >
      {!actualDescription ? null : <p className="text-bright mt-8 overflow-y-auto">{actualDescription}</p>}
    </DyoModal>
  )
}
