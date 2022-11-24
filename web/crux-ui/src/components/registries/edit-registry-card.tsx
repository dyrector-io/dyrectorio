import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoChips from '@app/elements/dyo-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoIconPicker from '@app/elements/dyo-icon-picker'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoTextArea from '@app/elements/dyo-text-area'
import { defaultApiErrorHandler } from '@app/errors'
import {
  CreateRegistry,
  GithubRegistryDetails,
  GitlabRegistryDetails,
  GoogleRegistryDetails,
  HubRegistryDetails,
  Registry,
  RegistryDetails,
  registryDetailsToRegistry,
  RegistryType,
  REGISTRY_TYPE_VALUES,
  UpdateRegistry,
  V2RegistryDetails,
} from '@app/models'
import { API_REGISTRIES, registryApiUrl } from '@app/routes'
import { FormikProps, sendForm } from '@app/utils'
import { registrySchema } from '@app/validations'
import { useFormik } from 'formik'
import useTranslation from 'next-translate/useTranslation'
import { MutableRefObject, useState } from 'react'
import GithubRegistryFields from './registry-fields/github-registry-field'
import GitlabRegistryFields from './registry-fields/gitlab-registry-field'
import GoogleRegistryFields from './registry-fields/google-registry-field'
import HubRegistryFields from './registry-fields/hub-registry-fields'
import V2RegistryFields from './registry-fields/v2-registry-field'

interface EditRegistryCardProps {
  className?: string
  registry?: RegistryDetails
  onRegistryEdited: (registry: Registry) => void
  submitRef: MutableRefObject<() => Promise<any>>
}

const EditRegistryCard = (props: EditRegistryCardProps) => {
  const { className, registry: propsRegistry, onRegistryEdited, submitRef } = props

  const { t } = useTranslation('registries')

  const [registry, setRegistry] = useState<RegistryDetails>(
    propsRegistry ?? {
      id: null,
      name: '',
      description: '',
      icon: null,
      url: '',
      type: 'v2',
      updatedAt: null,
      private: false,
      token: '',
      user: '',
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

      const transformedValues = registrySchema.cast(values) as any

      const body: CreateRegistry | UpdateRegistry = {
        ...transformedValues,
      }

      const res = await (!editing
        ? sendForm('POST', API_REGISTRIES, body as CreateRegistry)
        : sendForm('PUT', registryApiUrl(registry.id), body as UpdateRegistry))

      if (res.ok) {
        let result: RegistryDetails
        if (res.status !== 204) {
          const json = await res.json()
          result = json as RegistryDetails
        } else {
          result = {
            ...values,
          }
        }

        setRegistry(result)
        setSubmitting(false)
        onRegistryEdited(registryDetailsToRegistry(result))
      } else {
        setSubmitting(false)
        handleApiError(res, setFieldError)
      }
    },
  })

  if (submitRef) {
    submitRef.current = formik.submitForm
  }

  const registryType = formik.values.type

  const onRegistryTypeChange = (changedRegistry: RegistryType) => {
    if (registryType !== changedRegistry) {
      const meta = registrySchema.describe()
      const registrySchemaFieldDescription = Object.entries(meta.fields)

      registrySchemaFieldDescription.map(it => {
        const [field, value]: [string, any] = it
        if (value.meta?.reset) {
          formik.setFieldValue(field, '', false)
          formik.setFieldError(field, '')
        }

        return it
      })
    }

    if (changedRegistry === 'github') {
      formik.setFieldValue('namespace', 'organization', false)
    } else if (changedRegistry === 'gitlab') {
      formik.setFieldValue('namespace', 'group', false)
    }

    formik.setFieldValue('type', changedRegistry, false)
  }

  return (
    <DyoCard className={className}>
      <DyoHeading element="h4" className="text-lg text-bright">
        {editing ? t('common:editName', { name: registry.name }) : t('new')}
      </DyoHeading>

      <DyoLabel className="text-light">{t('tips.common')}</DyoLabel>

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
          <div className="flex flex-wrap mt-4">
            <DyoLabel className="mr-2 my-auto">{t('common:type')}</DyoLabel>

            <DyoChips
              choices={REGISTRY_TYPE_VALUES}
              initialSelection={formik.values.type}
              converter={(it: RegistryType) => t(`type.${it}`)}
              onSelectionChange={it => onRegistryTypeChange(it)}
            />
          </div>

          {registryType === 'hub' ? (
            <HubRegistryFields formik={formik as FormikProps<HubRegistryDetails>} />
          ) : registryType === 'v2' ? (
            <V2RegistryFields formik={formik as FormikProps<V2RegistryDetails>} />
          ) : registryType === 'gitlab' ? (
            <GitlabRegistryFields formik={formik as FormikProps<GitlabRegistryDetails>} />
          ) : registryType === 'github' ? (
            <GithubRegistryFields formik={formik as FormikProps<GithubRegistryDetails>} />
          ) : registryType === 'google' ? (
            <GoogleRegistryFields formik={formik as FormikProps<GoogleRegistryDetails>} />
          ) : (
            <div className="bg-red-500">Unknown registry type: ${registryType}</div>
          )}
        </div>

        <DyoButton className="hidden" type="submit" />
      </form>
    </DyoCard>
  )
}

export default EditRegistryCard
