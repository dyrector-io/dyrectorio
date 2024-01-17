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
  EditableGithubRegistryDetails,
  EditableGitlabRegistryDetails,
  EditableGoogleRegistryDetails,
  EditableHubRegistryDetails,
  EditableRegistry,
  EditableV2RegistryDetails,
  PUBLIC_REGISTRY_TYPES,
  REGISTRY_TYPE_VALUES,
  RegistryDetails,
  RegistryType,
  UncheckedRegistryDetails,
  UpdateRegistryDto,
  editableRegistryToDto,
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
  onRegistryEdited: (registry: RegistryDetails) => void
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
      public: true,
      updatedAt: null,
      inUse: false,
    },
  )

  const editing = !!registry.id

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useDyoFormik<EditableRegistry>({
    submit,
    initialValues: {
      ...registry,
      changeCredentials: !editing,
      user: '',
      token: '',
    },
    validationSchema: registrySchema,
    t,
    onSubmit: async (values, { setFieldError }) => {
      const transformedValues = registrySchema.cast(values) as any

      const body = {
        ...editableRegistryToDto({
          ...transformedValues,
        }),
      }

      const res = await (!editing
        ? sendForm('POST', routes.registry.api.list(), body as CreateRegistryDto)
        : sendForm('PUT', routes.registry.api.details(registry.id), body as UpdateRegistryDto))

      if (res.ok) {
        let result: EditableRegistry = {
          ...values,
          changeCredentials: false,
          user: '',
          token: '',
        }

        if (res.status !== 204) {
          const json: RegistryDetails = (await res.json()) as RegistryDetails
          result = {
            ...result,
            ...json,
          }
        }

        setRegistry(result)
        onRegistryEdited(result)
      } else {
        await handleApiError(res, setFieldError)
      }
    },
  })

  const registryType = formik.values.type

  const onRegistryTypeChange = async (newType: RegistryType): Promise<void> => {
    if (registryType !== newType) {
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

    if (newType === 'github') {
      await formik.setFieldValue('namespace', 'organization', false)
    } else if (newType === 'gitlab') {
      await formik.setFieldValue('namespace', 'group', false)
    } else if (PUBLIC_REGISTRY_TYPES.includes(newType)) {
      await formik.setFieldValue('public', true)
    }

    await formik.setFieldValue('type', newType, false)
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
            <HubRegistryFields formik={formik as FormikProps<EditableHubRegistryDetails>} />
          ) : registryType === 'v2' ? (
            <V2RegistryFields formik={formik as FormikProps<EditableV2RegistryDetails>} />
          ) : registryType === 'gitlab' ? (
            <GitlabRegistryFields formik={formik as FormikProps<EditableGitlabRegistryDetails>} />
          ) : registryType === 'github' ? (
            <GithubRegistryFields formik={formik as FormikProps<EditableGithubRegistryDetails>} />
          ) : registryType === 'google' ? (
            <GoogleRegistryFields formik={formik as FormikProps<EditableGoogleRegistryDetails>} />
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
