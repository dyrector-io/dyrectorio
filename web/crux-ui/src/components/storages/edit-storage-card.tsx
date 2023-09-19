import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoIconPicker from '@app/elements/dyo-icon-picker'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoMessage from '@app/elements/dyo-message'
import DyoTextArea from '@app/elements/dyo-text-area'
import { defaultApiErrorHandler } from '@app/errors'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import { SubmitHook } from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { CreateStorage, Storage, StorageDetails, UpdateStorage } from '@app/models'
import { sendForm } from '@app/utils'
import { storageSchema } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'

interface EditStorageCardProps {
  className?: string
  storage?: StorageDetails
  onStorageEdited: (registry: Storage) => void
  submit: SubmitHook
}

const EditStorageCard = (props: EditStorageCardProps) => {
  const { className, storage: propsStorage, onStorageEdited, submit } = props

  const { t } = useTranslation('storages')
  const routes = useTeamRoutes()

  const [storage, setStorage] = useState<StorageDetails>(
    propsStorage ?? {
      id: null,
      name: '',
      description: '',
      icon: null,
      url: '',
      accessKey: '',
      secretKey: '',
      inUse: false,
    },
  )

  const editing = !!storage.id

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useDyoFormik({
    submit,
    initialValues: {
      ...storage,
    },
    validationSchema: storageSchema,
    t,
    onSubmit: async (values, { setFieldError }) => {
      const body: CreateStorage | UpdateStorage = {
        ...values,
      }

      const res = await (!editing
        ? sendForm('POST', routes.storage.api.list(), body as CreateStorage)
        : sendForm('PUT', routes.storage.api.details(storage.id), body as UpdateStorage))

      if (res.ok) {
        let result: StorageDetails
        if (res.status !== 204) {
          result = (await res.json()) as StorageDetails
        } else {
          result = {
            ...values,
          }
        }

        setStorage(result)
        onStorageEdited(result)
      } else {
        await handleApiError(res, setFieldError)
      }
    },
  })

  return (
    <DyoCard className={className}>
      <DyoHeading element="h4" className="text-lg text-bright">
        {editing ? t('common:editName', { name: storage.name }) : t('new')}
      </DyoHeading>
      {formik.values.inUse && (
        <DyoMessage className="text-xs italic" message={t('storageAlreadyInUse')} messageType="info" />
      )}

      <DyoForm className="grid grid-cols-2 gap-8" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
        <div className="flex flex-col">
          <div className="flex flex-col">
            <DyoInput
              className="max-w-lg"
              grow
              name="name"
              type="name"
              label={t('common:name')}
              onChange={formik.handleChange}
              value={formik.values.name}
              message={formik.errors.name}
            />
          </div>

          <div className="w-full mt-2">
            <DyoLabel>{t('common:icon')}</DyoLabel>

            <DyoIconPicker name="icon" value={formik.values.icon} setFieldValue={formik.setFieldValue} />
          </div>

          <DyoTextArea
            className="h-48"
            grow
            name="description"
            label={t('common:description')}
            onChange={formik.handleChange}
            value={formik.values.description}
          />
        </div>

        <div className="flex flex-col">
          <DyoInput
            className="max-w-lg"
            grow
            name="url"
            type="text"
            placeholder="https://example.com"
            label={t('url')}
            onChange={formik.handleChange}
            value={formik.values.url}
            message={formik.errors.url}
          />

          <DyoInput
            className="max-w-lg"
            grow
            name="accessKey"
            type="text"
            label={t('accessKey')}
            onChange={formik.handleChange}
            value={formik.values.accessKey}
            message={formik.errors.accessKey}
          />

          <DyoInput
            className="max-w-lg"
            grow
            name="secretKey"
            type="password"
            label={t('secretKey')}
            onChange={formik.handleChange}
            value={formik.values.secretKey}
            message={formik.errors.secretKey}
          />
        </div>

        <DyoButton className="hidden" type="submit" />
      </DyoForm>
    </DyoCard>
  )
}

export default EditStorageCard
