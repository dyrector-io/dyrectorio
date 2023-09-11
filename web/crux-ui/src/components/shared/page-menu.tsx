import DyoButton from '@app/elements/dyo-button'
import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import useConfirmation from '@app/hooks/use-confirmation'
import { SubmitHook } from '@app/hooks/use-submit'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import React from 'react'

export type ListPageMenuTexts = {
  add?: string
  discard?: string
  save?: string
}

export interface ListPageMenuProps {
  texts?: ListPageMenuTexts
  creating: boolean
  setCreating: (editing: boolean) => void
  submit: SubmitHook
}

export const ListPageMenu = (props: ListPageMenuProps) => {
  const { texts: propsTexts, creating, setCreating, submit } = props

  const { t } = useTranslation('common')

  const texts = propsTexts ?? {}

  return !creating ? (
    <DyoButton className="ml-auto px-4" onClick={() => setCreating(true)}>
      {texts.add ?? t('add')}
    </DyoButton>
  ) : (
    <>
      <DyoButton className="ml-auto px-4" secondary onClick={() => setCreating(false)}>
        {texts.discard ?? t('discard')}
      </DyoButton>

      <DyoButton className="px-4 ml-4" onClick={() => submit.submit()}>
        {texts.save ?? t('save')}
      </DyoButton>
    </>
  )
}

export type DetailsPageTexts = {
  edit?: string
  delete?: string
  addDetailsItem?: string
  discard?: string
  save?: string
}

export interface DetailsPageMenuProps {
  texts?: DetailsPageTexts
  onAdd?: VoidFunction
  onDelete: VoidFunction
  disableEditing?: boolean
  editing: boolean
  setEditing: (editing: boolean) => void
  submit: SubmitHook
  deleteModalTitle: string
  deleteModalDescription?: string
}

export const DetailsPageMenu = (props: React.PropsWithChildren<DetailsPageMenuProps>) => {
  const {
    texts: propsTexts,
    disableEditing,
    editing,
    setEditing,
    submit,
    onDelete,
    onAdd,
    deleteModalTitle,
    deleteModalDescription,
    children,
  } = props

  const { t } = useTranslation('common')

  const [deleteModalConfig, confirmDelete] = useConfirmation()

  const texts = propsTexts ?? {}

  const deleteClick = async () => {
    const confirmed = await confirmDelete({
      title: deleteModalTitle,
      description: deleteModalDescription,
      confirmText: texts.delete ?? t('delete'),
      confirmColor: 'bg-error-red',
    })

    if (!confirmed) {
      return
    }

    onDelete()
  }

  return !editing ? (
    <>
      {disableEditing ? null : (
        <DyoButton className="ml-auto px-10 mx-2" onClick={() => setEditing(true)}>
          {texts.edit ?? t('edit')}
        </DyoButton>
      )}

      {!onDelete ? null : (
        <DyoButton className={clsx(onAdd ? 'mx-2' : 'ml-2', 'px-6')} color="bg-error-red" onClick={deleteClick}>
          {texts.delete ?? t('delete')}
        </DyoButton>
      )}

      {!onAdd ? null : (
        <DyoButton className="px-6 ml-2" onClick={onAdd}>
          {texts.addDetailsItem ?? t('addDetailsItem')}
        </DyoButton>
      )}

      {!onDelete ? null : <DyoConfirmationModal config={deleteModalConfig} className="w-1/4" />}
    </>
  ) : (
    <>
      <DyoButton className="ml-auto px-6 mr-2" secondary onClick={() => setEditing(false)}>
        {texts.discard ?? t('discard')}
      </DyoButton>

      {children}

      <DyoButton className="px-6 ml-2" onClick={() => submit.submit()}>
        {texts.save ?? t('save')}
      </DyoButton>
    </>
  )
}

interface SaveDiscardPageMenuProps {
  className?: string
  saveRef: SubmitHook
  onSave?: VoidFunction
  onDiscard: VoidFunction
}

export const SaveDiscardPageMenu = (props: SaveDiscardPageMenuProps) => {
  const { className, saveRef, onSave, onDiscard } = props

  const { t } = useTranslation('common')

  const onSaveSaveClick = () => {
    saveRef.submit()
    onSave?.call(null)
  }

  return (
    <div className={className ?? 'ml-auto'}>
      <DyoButton className="px-6 mr-2" secondary onClick={onDiscard}>
        {t('discard')}
      </DyoButton>

      <DyoButton className="px-6 ml-2" onClick={onSaveSaveClick}>
        {t('save')}
      </DyoButton>
    </div>
  )
}
