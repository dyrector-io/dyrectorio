import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoIconPicker from '@app/elements/dyo-icon-picker'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoTextArea from '@app/elements/dyo-text-area'
import { defaultApiErrorHandler } from '@app/errors'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import { CreateStorage, Storage, StorageDetails, UpdateStorage } from '@app/models'
import { API_STORAGES, storageApiUrl } from '@app/routes'
import { sendForm } from '@app/utils'
import { storageSchema } from '@app/validations/storage'
import useTranslation from 'next-translate/useTranslation'
import { MutableRefObject, useState } from 'react'

interface EditStorageCardProps {
  className?: string
  storage?: StorageDetails
  onStorageEdited: (registry: Storage) => void
  submitRef: MutableRefObject<() => Promise<any>>
}

const EditStorageCard = (props: EditStorageCardProps) => {
  const { className, storage: propsStorage, onStorageEdited, submitRef } = props

  const { t } = useTranslation('storages')

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
    initialValues: {
      ...storage,
    },
    validationSchema: storageSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setSubmitting(true)

      const body: CreateStorage | UpdateStorage = {
        ...values,
      }

      const res = await (!editing
        ? sendForm('POST', API_STORAGES, body as CreateStorage)
        : sendForm('PUT', storageApiUrl(storage.id), body as UpdateStorage))

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
        setSubmitting(false)
        onStorageEdited(result)
      } else {
        setSubmitting(false)
        handleApiError(res, setFieldError)
      }
    },
  })

  if (submitRef) {
    submitRef.current = formik.submitForm
  }

  return (
    <DyoCard className={className}>
      <DyoHeading element="h4" className="text-lg text-bright">
        {editing ? t('common:editName', { name: storage.name }) : t('new')}
      </DyoHeading>

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
            {formik.values.inUse && (
              <DyoLabel className="mt-2" textColor="text-sm text-warning-orange">
                {t('storageAlreadyInUse')}
              </DyoLabel>
            )}
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
