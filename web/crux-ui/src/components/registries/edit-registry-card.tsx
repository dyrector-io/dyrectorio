import { DyoButton } from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoChips from '@app/elements/dyo-chips'
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
  HubRegistryDetails,
  Registry,
  RegistryDetails,
  registryDetailsToRegistry,
  RegistryType,
  REGISTRY_TYPE_VALUES,
  UpdateProduct,
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
            <div className="flex flex-wrap mt-4">
              <DyoLabel className="mr-2 my-auto">{t('common:type')}</DyoLabel>

              <DyoChips
                choices={REGISTRY_TYPE_VALUES}
                initialSelection={[formik.values.type]}
                converter={(it: RegistryType) => t(`type.${it}`)}
                onChoicesChange={it => formik.setFieldValue('type', it[0], false)}
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
      <DyoLabel className="text-light mt-2">{t('hubTips')}</DyoLabel>

      <DyoInput
        className="max-w-lg"
        grow
        name="urlPrefix"
        type="text"
        label={t('orgOrUser')}
        onChange={formik.handleChange}
        value={formik.values.urlPrefix}
        message={formik.errors.urlPrefix}
      />
    </>
  )
}

const V2RegistryFields = (props: EditRegistryTypeProps<V2RegistryDetails>) => {
  const { formik } = props

  const { t } = useTranslation('registries')

  return (
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

      <div className="mr-auto">
        <DyoToggle
          className="text-bright mt-8"
          name="_private"
          nameChecked={t('private')}
          nameUnchecked={t('public')}
          checked={formik.values._private}
          setFieldValue={formik.setFieldValue}
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
        name="urlPrefix"
        type="text"
        label={t('group')}
        onChange={formik.handleChange}
        value={formik.values.urlPrefix}
        message={formik.errors.urlPrefix}
      />

      <div className="mr-auto">
        <DyoToggle
          className="text-bright mt-8"
          name="selfManaged"
          nameChecked={t('selfManaged')}
          nameUnchecked={t('saas')}
          checked={formik.values.selfManaged}
          setFieldValue={formik.setFieldValue}
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
        name="urlPrefix"
        label={t('organization')}
        onChange={formik.handleChange}
        value={formik.values.urlPrefix}
        message={formik.errors.urlPrefix}
      />
    </>
  )
}
