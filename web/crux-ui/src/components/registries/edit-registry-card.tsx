import { REGISTRY_HUB_URL } from '@app/const'
import { DyoButton } from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoIconPicker from '@app/elements/dyo-icon-picker'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import { DyoTextArea } from '@app/elements/dyo-text-area'
import { DyoToggle } from '@app/elements/dyo-toggle'
import { defaultApiErrorHandler } from '@app/errors'
import { CreateRegistry, Registry, RegistryDetails, RegistryType, UpdateProduct, UpdateRegistry } from '@app/models'
import { API_REGISTRIES, registryApiUrl } from '@app/routes'
import { formikFieldValueConverter, sendForm } from '@app/utils'
import { registrySchema } from '@app/validation'
import { useFormik } from 'formik'
import useTranslation from 'next-translate/useTranslation'
import React, { MutableRefObject, useState } from 'react'

interface EditRegistryCardProps {
  className?: string
  registry?: RegistryDetails
  onSubmittingChange?: (submitting: boolean) => void
  onRegistryEdited: (product: Registry) => void
  submitRef: MutableRefObject<() => Promise<any>>
}

const EditRegistryCard = (props: EditRegistryCardProps) => {
  const { t } = useTranslation('registries')

  const [registry, setRegistry] = useState<RegistryDetails>(
    props.registry ?? {
      id: null,
      name: '',
      description: '',
      icon: null,
      url: '',
      type: 'v2',
      updatedAt: null,
    },
  )

  const editing = !!registry.id

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useFormik({
    initialValues: {
      ...registry,
    },
    validationSchema: registrySchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setSubmitting(true)

      const body: CreateRegistry | UpdateRegistry = {
        ...values,
      }

      const res = await (!editing
        ? sendForm('POST', API_REGISTRIES, body as CreateRegistry)
        : sendForm('PUT', registryApiUrl(registry.id), body as UpdateProduct))

      if (res.ok) {
        let result: RegistryDetails
        if (res.status != 204) {
          const json = await res.json()
          result = json as RegistryDetails
        } else {
          result = {
            ...values,
          }
        }

        setRegistry(result)
        props.onRegistryEdited(result)
      } else {
        handleApiError(res, setFieldError)
      }

      setSubmitting(false)
    },
  })

  if (props.submitRef) {
    props.submitRef.current = formik.submitForm
  }

  const hubRegistry = formik.values.type === 'hub'

  return (
    <>
      <DyoCard className={props.className}>
        <DyoHeading element="h4" className="text-lg text-bright">
          {editing ? t('common:editName', { name: registry.name }) : t('new')}
        </DyoHeading>

        <DyoLabel className="text-light">{t('tips')}</DyoLabel>

        <form className="grid grid-cols-2 gap-8" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
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
            <div className="mr-auto">
              <DyoToggle
                className="text-bright"
                name="type"
                nameChecked={t('hub')}
                nameUnchecked={t('v2')}
                checked={hubRegistry}
                setFieldValue={formikFieldValueConverter<RegistryType>(formik, it => {
                  const type = it ? 'hub' : 'v2'

                  if (type === 'hub') {
                    formik.setFieldValue('url', REGISTRY_HUB_URL)
                  }

                  return type
                })}
              />
            </div>

            <DyoInput
              className="max-w-lg"
              disabled={hubRegistry}
              grow
              name="url"
              type="text"
              label={t('url')}
              onChange={formik.handleChange}
              value={formik.values.url}
              message={formik.errors.url}
            />

            {hubRegistry ? null : (
              <>
                <DyoInput
                  className="max-w-lg"
                  grow
                  name="user"
                  type="text"
                  label={t('user')}
                  onChange={formik.handleChange}
                  value={formik.values.user}
                  message={formik.errors.user}
                />

                <DyoInput
                  className="max-w-lg"
                  grow
                  name="token"
                  type="text"
                  label={t('token')}
                  onChange={formik.handleChange}
                  value={formik.values.token}
                  message={formik.errors.token}
                />
              </>
            )}
          </div>

          <DyoButton className="hidden" type="submit"></DyoButton>
        </form>
      </DyoCard>
    </>
  )
}

export default EditRegistryCard
