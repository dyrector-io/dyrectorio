import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoChips, { chipsQALabelFromValue } from '@app/elements/dyo-chips'
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
import {
  CreateRegistryDto,
  GithubRegistryDetails,
  GitlabRegistryDetails,
  GoogleRegistryDetails,
  HubRegistryDetails,
  REGISTRY_TYPE_VALUES,
  Registry,
  RegistryDetails,
  RegistryType,
  UncheckedRegistryDetails,
  UpdateRegistryDto,
  V2RegistryDetails,
  registryCreateToDto,
  registryDetailsToRegistry,
} from '@app/models'
import { FormikProps, sendForm } from '@app/utils'
import { registrySchema } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'
import GithubRegistryFields from './registry-fields/github-registry-field'
import GitlabRegistryFields from './registry-fields/gitlab-registry-field'
import GoogleRegistryFields from './registry-fields/google-registry-field'
import HubRegistryFields from './registry-fields/hub-registry-fields'
import UncheckedRegistryFields from './registry-fields/unchecked-registry-field'
import V2RegistryFields from './registry-fields/v2-registry-field'

interface EditRegistryCardProps {
  className?: string
  registry?: RegistryDetails
  onRegistryEdited: (registry: Registry) => void
  submit: SubmitHook
}

const EditRegistryCard = (props: EditRegistryCardProps) => {
  const { className, registry: propsRegistry, onRegistryEdited, submit } = props

  const { t } = useTranslation('registries')
  const routes = useTeamRoutes()

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
      inUse: false,
    },
  )

  const editing = !!registry.id

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useDyoFormik({
    submit,
    initialValues: {
      ...registry,
    },
    validationSchema: registrySchema,
    t,
    onSubmit: async (values, { setFieldError }) => {
      const transformedValues = registrySchema.cast(values) as any

      const body = {
        ...registryCreateToDto({
          ...transformedValues,
        }),
      }

      const res = await (!editing
        ? sendForm('POST', routes.registry.api.list(), body as CreateRegistryDto)
        : sendForm('PUT', routes.registry.api.details(registry.id), body as UpdateRegistryDto))

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
        onRegistryEdited(registryDetailsToRegistry(result))
      } else {
        await handleApiError(res, setFieldError)
      }
    },
  })

  const registryType = formik.values.type

  const onRegistryTypeChange = async (changedRegistry: RegistryType): Promise<void> => {
    if (registryType !== changedRegistry) {
      const meta = registrySchema.describe()
      const registrySchemaFieldDescription = Object.entries(meta.fields)

      await Promise.all(
        registrySchemaFieldDescription.map(async (it): Promise<void> => {
          const [field, value]: [string, any] = it
          if (value.meta?.reset) {
            await formik.setFieldValue(field, '', false)
            await formik.setFieldError(field, '')
          }
        }),
      )
    }

    if (changedRegistry === 'github') {
      await formik.setFieldValue('namespace', 'organization', false)
    } else if (changedRegistry === 'gitlab') {
      await formik.setFieldValue('namespace', 'group', false)
    }

    await formik.setFieldValue('type', changedRegistry, false)
  }

  return (
    <DyoCard className={className}>
      <DyoHeading element="h4" className="text-lg text-bright">
        {editing ? t('common:editName', { name: registry.name }) : t('new')}
      </DyoHeading>

      <DyoLabel className="text-light block">{t('tips.common')}</DyoLabel>

      {formik.values.inUse && (
        <DyoMessage className="text-xs italic" message={t('registryAlreadyInUse')} messageType="info" />
      )}

      <DyoForm className="grid grid-cols-2 gap-8" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
        <div className="flex flex-col">
          <div className="flex flex-col mt-4">
            <DyoInput
              className="max-w-lg"
              grow
              name="name"
              type="name"
              label={t('common:name')}
              labelClassName="mr-2 mb-1 text-light-eased"
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
          <div className="flex flex-wrap mt-4">
            <DyoLabel className="mr-2 my-auto">{t('common:type')}</DyoLabel>

            <DyoChips
              name="registryType"
              choices={REGISTRY_TYPE_VALUES}
              selection={formik.values.type}
              converter={(it: RegistryType) => t(`type.${it}`)}
              onSelectionChange={it => onRegistryTypeChange(it)}
              qaLabel={chipsQALabelFromValue}
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
          ) : registryType === 'unchecked' ? (
            <UncheckedRegistryFields formik={formik as FormikProps<UncheckedRegistryDetails>} />
          ) : (
            <div className="bg-red-500">{t('unknownRegistryType', { registryType })}</div>
          )}
        </div>

        <DyoButton className="hidden" type="submit" />
      </DyoForm>
    </DyoCard>
  )
}

export default EditRegistryCard
