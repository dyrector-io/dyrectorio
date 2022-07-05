import { Dialog } from '@headlessui/react'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import React from 'react'
import { DyoButton } from './dyo-button'
import { DyoCard } from './dyo-card'
import { DyoHeading } from './dyo-heading'

export interface DyoModalProps {
  className?: string
  title: string
  description?: string
  buttons?: React.ReactNode
  children?: React.ReactNode
  open: boolean
  onClose: () => void
}

const DyoModal = (props: DyoModalProps) => {
  const { t } = useTranslation('common')

  const buttons = props.buttons ?? (
    <>
      <DyoButton onClick={() => props.onClose()}>{t('close')}</DyoButton>
    </>
  )

  const modal = (
    <>
      <Dialog
        className="flex fixed inset-0 bg-light-grey bg-opacity-50 h-screen w-screen"
        open={props.open}
        onClose={() => props.onClose()}
      >
        <Dialog.Overlay />

        <DyoCard className={clsx(props.className, 'flex flex-col m-auto p-8')}>
          <DyoHeading element="h4" className="text-xl font-bold text-bright">
            {props.title}
          </DyoHeading>
          {!props.description ? null : <Dialog.Description>{props.description}</Dialog.Description>}

          {props.children}

          <div className="mx-auto mt-auto pt-8">{buttons}</div>
        </DyoCard>
      </Dialog>
    </>
  )

  return modal
}

export default DyoModal

export type DyoConfirmationModalConfig = {
  onClose: (boolean) => void
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

  const { confirmText, cancelText, confirmColor, cancelColor, description, config, ...forwardedProps } = props

  if (!config) {
    return null
  }

  const { onClose } = config

  return (
    <DyoModal
      {...forwardedProps}
      open
      onClose={() => onClose(false)}
      buttons={
        <>
          <DyoButton color={confirmColor} onClick={() => onClose(true)}>
            {confirmText ?? t('confirm')}
          </DyoButton>
          <DyoButton color={cancelColor} onClick={() => onClose(false)}>
            {cancelText ?? t('cancel')}
          </DyoButton>
        </>
      }
    >
      {!props.description ? null : <p className="text-bright mt-8 overflow-y-auto">{props.description}</p>}
    </DyoModal>
  )
}
