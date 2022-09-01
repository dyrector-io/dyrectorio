import { DyoButton } from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoChips from '@app/elements/dyo-chips'
import { DyoFileUploadInput } from '@app/elements/dyo-file-upload'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoIconPicker from '@app/elements/dyo-icon-picker'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import { DyoTextArea } from '@app/elements/dyo-text-area'
import { DyoToggle } from '@app/elements/dyo-toggle'
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
import { FormikSetFieldValue, sendForm } from '@app/utils'
import { registrySchema } from '@app/validation'
import { FormikHandlers, FormikState, useFormik } from 'formik'
import useTranslation from 'next-translate/useTranslation'
import { MutableRefObject, useState } from 'react'

interface EditRegistryCardProps {
  className?: string
  registry?: RegistryDetails
  onSubmittingChange?: (submitting: boolean) => void
  onRegistryEdited: (registry: Registry) => void
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
      _private: false,
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
        if (res.status != 204) {
          const json = await res.json()
          result = json as RegistryDetails
        } else {
          result = {
            ...values,
          }
        }

        setRegistry(result)
        props.onRegistryEdited(registryDetailsToRegistry(result))
      } else {
        handleApiError(res, setFieldError)
      }

      setSubmitting(false)
    },
  })

  if (props.submitRef) {
    props.submitRef.current = formik.submitForm
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
      })
    }

    formik.setFieldValue('type', changedRegistry, false)
  }

  return (
    <>
      <DyoCard className={props.className}>
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

          <DyoButton className="hidden" type="submit"></DyoButton>
        </form>
      </DyoCard>
    </>
  )
}

export default EditRegistryCard

type FormikProps<T> = FormikState<T> &
  FormikHandlers & {
    setFieldValue: FormikSetFieldValue
  }

type EditRegistryTypeProps<T = RegistryDetails> = {
  formik: FormikProps<T>
}

const HubRegistryFields = (props: EditRegistryTypeProps<HubRegistryDetails>) => {
  const { formik } = props

  const { t } = useTranslation('registries')

  return (
    <>
      <DyoLabel className="text-light mt-2">{t('tips.hub')}</DyoLabel>

      <DyoInput
        className="max-w-lg"
        grow
        name="imageNamePrefix"
        type="text"
        label={t('orgOrUser')}
        onChange={formik.handleChange}
        value={formik.values.imageNamePrefix}
        message={formik.errors.imageNamePrefix}
      />
    </>
  )
}

const V2RegistryFields = (props: EditRegistryTypeProps<V2RegistryDetails>) => {
  const { formik } = props

  const { t } = useTranslation('registries')

  return (
    <>
      <DyoLabel className="text-light mt-2">{t('tips.v2')}</DyoLabel>

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

      <div className="mr-auto">
        <DyoToggle
          className="text-bright mt-8"
          name="_private"
          nameChecked={t('private')}
          nameUnchecked={t('public')}
          checked={formik.values._private}
          setFieldValue={(field: string, value: boolean, shouldValidate?: boolean | undefined) => {
            if (!value) {
              formik.setFieldValue('user', '', false)
              formik.setFieldValue('token', '', false)
            }
            return formik.setFieldValue(field, value, shouldValidate)
          }}
        />
      </div>

      {!formik.values._private ? null : (
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
            type="password"
            label={t('token')}
            onChange={formik.handleChange}
            value={formik.values.token}
            message={formik.errors.token}
          />
        </>
      )}
    </>
  )
}

const GitlabRegistryFields = (props: EditRegistryTypeProps<GitlabRegistryDetails>) => {
  const { formik } = props

  const { t } = useTranslation('registries')

  return (
    <>
      <DyoLabel className="text-light mt-2">{t('tips.gitlab')}</DyoLabel>

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
        type="password"
        label={t('token')}
        onChange={formik.handleChange}
        value={formik.values.token}
        message={formik.errors.token}
      />

      <DyoInput
        className="max-w-lg"
        grow
        name="imageNamePrefix"
        type="text"
        label={t('group')}
        onChange={formik.handleChange}
        value={formik.values.imageNamePrefix}
        message={formik.errors.imageNamePrefix}
      />

      <div className="mr-auto">
        <DyoToggle
          className="text-bright mt-8"
          name="selfManaged"
          nameChecked={t('selfManaged')}
          nameUnchecked={t('saas')}
          checked={formik.values.selfManaged}
          setFieldValue={(field: string, value: boolean, shouldValidate?: boolean | undefined) => {
            if (!value) {
              formik.setFieldValue('url', '', false)
              formik.setFieldValue('apiUrl', '', false)
            }
            return formik.setFieldValue(field, value, shouldValidate)
          }}
        />
      </div>

      {!formik.values.selfManaged ? null : (
        <>
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
            name="apiUrl"
            type="text"
            label={t('apiUrl')}
            onChange={formik.handleChange}
            value={formik.values.apiUrl}
            message={formik.errors.apiUrl}
          />
        </>
      )}
    </>
  )
}

const GithubRegistryFields = (props: EditRegistryTypeProps<GithubRegistryDetails>) => {
  const { formik } = props

  const { t } = useTranslation('registries')

  return (
    <>
      <DyoLabel className="text-light mt-2">{t('tips.github')}</DyoLabel>

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
        type="password"
        label={t('pat')}
        onChange={formik.handleChange}
        value={formik.values.token}
        message={formik.errors.token}
      />

      <DyoInput
        className="max-w-lg"
        grow
        name="imageNamePrefix"
        label={t('organization')}
        onChange={formik.handleChange}
        value={formik.values.imageNamePrefix}
        message={formik.errors.imageNamePrefix}
      />
    </>
  )
}

const GoogleRegistryFields = (props: EditRegistryTypeProps<GoogleRegistryDetails>) => {
  const { formik } = props

  const { t } = useTranslation('registries')

  const uploadHandler = keyFile => {
    const fileReader = new FileReader()
    fileReader.readAsText(keyFile, 'UTF-8')
    fileReader.onload = event => {
      const json = JSON.parse(event.target.result.toString())
      formik.setFieldValue('user', json.client_email ? json.client_email : '')
      formik.setFieldValue('token', json.private_key ? json.private_key : '')
    }
  }

  return (
    <>
      <DyoLabel className="text-light mt-2">{t('tips.google')}</DyoLabel>

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
        name="imageNamePrefix"
        type="text"
        label={t('organization')}
        onChange={formik.handleChange}
        value={formik.values.imageNamePrefix}
        message={formik.errors.imageNamePrefix}
      />

      <div className="mr-auto">
        <DyoToggle
          className="text-bright mt-8"
          name="_private"
          nameChecked={t('private')}
          nameUnchecked={t('public')}
          checked={formik.values._private}
          setFieldValue={(field: string, value: boolean, shouldValidate?: boolean | undefined) => {
            if (!value) {
              formik.setFieldValue('user', '', false)
              formik.setFieldValue('token', '', false)
            }
            return formik.setFieldValue(field, value, shouldValidate)
          }}
        />
      </div>

      {!formik.values._private ? null : (
        <>
          <DyoFileUploadInput
            name="uploadFile"
            accept="application/JSON"
            multiple={false}
            label={t('keyFile')}
            handleFile={event => uploadHandler(event)}
          />

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

          <DyoTextArea
            className="max-w-lg"
            grow
            name="token"
            label={t('privateKey')}
            onChange={formik.handleChange}
            value={formik.values.token}
            message={formik.errors.token}
          />
        </>
      )}
    </>
  )
}
