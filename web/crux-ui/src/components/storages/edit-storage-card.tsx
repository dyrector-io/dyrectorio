import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoIconPicker from '@app/elements/dyo-icon-picker'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoMessage from '@app/elements/dyo-message'
import DyoPassword from '@app/elements/dyo-password'
import DyoTextArea from '@app/elements/dyo-text-area'
import DyoToggle from '@app/elements/dyo-toggle'
import { defaultApiErrorHandler } from '@app/errors'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import { SubmitHook } from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { CreateStorage, EditableStorage, StorageDetails, UpdateStorage, editableStorageToDto } from '@app/models'
import { formikSetFieldValueOrIgnore, sendForm } from '@app/utils'
import { storageSchema } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'

interface EditStorageCardProps {
  className?: string
  storage?: StorageDetails
  onStorageEdited: (registry: StorageDetails) => void
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
      public: false,
      inUse: false,
    },
  )

  const editing = !!storage.id

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useDyoFormik<EditableStorage>({
    submit,
    initialValues: {
      ...storage,
      changeCredentials: !editing,
      accessKey: '',
      secretKey: '',
    },
    validationSchema: storageSchema,
    t,
    onSubmit: async (values, { setFieldError }) => {
      const body: CreateStorage | UpdateStorage = editableStorageToDto(values)

      const res = await (!editing
        ? sendForm('POST', routes.storage.api.list(), body as CreateStorage)
        : sendForm('PUT', routes.storage.api.details(storage.id), body as UpdateStorage))

      if (res.ok) {
        let result: EditableStorage = {
          ...values,
          changeCredentials: false,
          accessKey: '',
          secretKey: '',
        }

        if (res.status !== 204) {
          const json = (await res.json()) as StorageDetails
          result = {
            ...result,
            ...json,
          }
        }

        setStorage(result)
        onStorageEdited(result)
      } else {
        await handleApiError(res, setFieldError)
      }
    },
  })

  const { values, errors, handleChange, setFieldValue } = formik

  return (
    <DyoCard className={className}>
      <DyoHeading element="h4" className="text-lg text-bright">
        {editing ? t('common:editName', { name: storage.name }) : t('new')}
      </DyoHeading>
      {values.inUse && <DyoMessage className="text-xs italic" message={t('storageAlreadyInUse')} messageType="info" />}

      <DyoForm className="grid grid-cols-2 gap-8" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
        <div className="flex flex-col">
          <div className="flex flex-col">
            <DyoInput
              className="max-w-lg"
              grow
              name="name"
              type="name"
              label={t('common:name')}
              onChange={handleChange}
              value={values.name}
              message={errors.name}
            />
          </div>

          <div className="w-full mt-2">
            <DyoLabel>{t('common:icon')}</DyoLabel>

            <DyoIconPicker name="icon" value={values.icon} setFieldValue={setFieldValue} />
          </div>

          <DyoTextArea
            className="h-48"
            grow
            name="description"
            label={t('common:description')}
            onChange={handleChange}
            value={values.description}
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
            onChange={handleChange}
            value={values.url}
            message={errors.url}
          />

          <DyoToggle
            className="mt-8"
            name="public"
            label={t('common:public')}
            checked={values.public}
            setFieldValue={async (field, value, shouldValidate) => {
              if (!value) {
                await setFieldValue('user', '', false)
                await setFieldValue('token', '', false)
              }

              await setFieldValue(field, value, shouldValidate)
            }}
          />

          {!values.public && (
            <>
              <DyoToggle
                className="mt-8"
                name="changeCredentials"
                label={t('common:changeCredentials')}
                checked={values.changeCredentials}
                setFieldValue={formikSetFieldValueOrIgnore(formik, !editing)}
              />

              {values.changeCredentials && (
                <>
                  <DyoInput
                    className="max-w-lg"
                    grow
                    name="accessKey"
                    type="text"
                    label={t('accessKey')}
                    onChange={handleChange}
                    value={values.accessKey}
                    message={errors.accessKey}
                  />

                  <DyoPassword
                    className="max-w-lg"
                    grow
                    name="secretKey"
                    label={t('secretKey')}
                    onChange={handleChange}
                    value={values.secretKey}
                    message={errors.secretKey}
                  />
                </>
              )}
            </>
          )}
        </div>

        <DyoButton className="hidden" type="submit" />
      </DyoForm>
    </DyoCard>
  )
}

export default EditStorageCard
