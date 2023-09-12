import DyoButton from '@app/elements/dyo-button'
import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import useConfirmation from '@app/hooks/use-confirmation'
import useTranslation from 'next-translate/useTranslation'
import React from 'react'

export type DetailsPageTexts = {
  edit?: string
  delete?: string
  addDetailsItem?: string
  discard?: string
  save?: string
}

export interface ConfigBundlePageMenuProps {
  editing: boolean
  deleteModalTitle: string
  deleteModalDescription?: string
  onDelete: VoidFunction
  setEditing: (editing: boolean) => void
}

export const ConfigBundlePageMenu = (props: ConfigBundlePageMenuProps) => {
  const { editing, deleteModalTitle, deleteModalDescription, setEditing, onDelete } = props

  const { t } = useTranslation('common')

  const [deleteModalConfig, confirmDelete] = useConfirmation()

  const deleteClick = async () => {
    const confirmed = await confirmDelete({
      title: deleteModalTitle,
      description: deleteModalDescription,
      confirmText: t('delete'),
      confirmColor: 'bg-error-red',
    })

    if (!confirmed) {
      return
    }

    onDelete()
  }

  return editing ? (
    <DyoButton className="ml-auto px-6" secondary onClick={() => setEditing(false)}>
      {t('back')}
    </DyoButton>
  ) : (
    <>
      <DyoButton className="ml-auto px-10 mx-2" onClick={() => setEditing(true)}>
        {t('edit')}
      </DyoButton>

      {!onDelete ? null : (
        <DyoButton className="ml-2 px-6" color="bg-error-red" onClick={deleteClick}>
          {t('delete')}
        </DyoButton>
      )}

      <DyoConfirmationModal config={deleteModalConfig} className="w-1/4" />
    </>
  )
}
