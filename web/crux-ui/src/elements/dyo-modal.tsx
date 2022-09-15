import DyoButton from '@app/elements/dyo-button'
import { Dialog } from '@headlessui/react'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import React from 'react'
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
  onClose: () => void
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

  const modal = (
    <Dialog className="flex fixed inset-0 bg-light-grey bg-opacity-50 h-screen w-screen" open={open} onClose={onClose}>
      <Dialog.Overlay />

      <DyoCard className={clsx(className, 'flex flex-col m-auto p-8')} modal>
        <DyoHeading element="h4" className={titleClassName ?? 'text-xl font-bold text-bright'}>
          {title}
        </DyoHeading>
        {!description ? null : <Dialog.Description className={descClassName}>{description}</Dialog.Description>}
        {children}

        <div className="mx-auto mt-auto pt-8">{buttons}</div>
      </DyoCard>
    </Dialog>
  )

  return modal
}

export default DyoModal

export type DyoConfirmationModalConfig = {
  onClose: (boolean) => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
}

export type DyoConfirmationModalProps = Omit<DyoModalProps, 'buttons' | 'children' | 'onClose' | 'open'> & {
  config: DyoConfirmationModalConfig
  confirmText?: string
  cancelText?: string
  confirmColor?: string
  cancelColor?: string
}

export const DyoConfirmationModal = (props: DyoConfirmationModalProps) => {
  const { t } = useTranslation('common')

  const {
    confirmText,
    cancelText,
    confirmColor,
    cancelColor,
    description,
    config,
    title,
    className,
    ...forwardedProps
  } = props

  if (!config) {
    return null
  }

  const { onClose } = config

  const actualDescription = config.description ?? description

  return (
    <DyoModal
      {...forwardedProps}
      className={clsx(className, 'min-w-[450px]')}
      title={config?.title ?? title}
      open
      onClose={() => onClose(false)}
      buttons={
        <>
          <DyoButton color={confirmColor} onClick={() => onClose(true)}>
            {config.confirmText ?? confirmText ?? t('confirm')}
          </DyoButton>
          <DyoButton color={cancelColor} onClick={() => onClose(false)}>
            {config.cancelText ?? cancelText ?? t('cancel')}
          </DyoButton>
        </>
      }
    >
      {!actualDescription ? null : <p className="text-bright mt-8 overflow-y-auto">{actualDescription}</p>}
    </DyoModal>
  )
}
