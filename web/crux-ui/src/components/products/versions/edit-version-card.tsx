import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoChips from '@app/elements/dyo-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoTextArea from '@app/elements/dyo-text-area'
import { defaultApiErrorHandler } from '@app/errors'
import useVersionHint from '@app/hooks/use-version-hint'
import { CreateVersion, EditableVersion, Product, UpdateVersion, VERSION_TYPE_VALUES } from '@app/models'
import { productVersionsApiUrl, versionApiUrl } from '@app/routes'
import { sendForm } from '@app/utils'
import { createVersionSchema, updateVersionSchema } from '@app/validations'
import { useFormik } from 'formik'
import useTranslation from 'next-translate/useTranslation'
import { MutableRefObject, useState } from 'react'

interface EditVersionCardProps {
  className?: string
  product: Product
  version?: EditableVersion
  onVersionEdited: (version: EditableVersion) => void
  submitRef?: MutableRefObject<() => Promise<any>>
}

const EditVersionCard = (props: EditVersionCardProps) => {
  const { product, className, version: propsVersion, onVersionEdited, submitRef } = props

  const { t } = useTranslation('versions')

  const [version, setVersion] = useState<EditableVersion>(
    propsVersion ?? {
      id: null,
      name: '',
      changelog: '',
      type: 'incremental',
      increasable: true,
      updatedAt: null,
    },
  )

  const editing = !!version.id

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useFormik({
    validationSchema: !editing ? createVersionSchema : updateVersionSchema,
    initialValues: {
      ...version,
    },
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setSubmitting(true)

      const body: CreateVersion | UpdateVersion = values

      const res = await (!editing
        ? sendForm('POST', productVersionsApiUrl(product.id), body as CreateVersion)
        : sendForm('PUT', versionApiUrl(product.id, version.id), body as UpdateVersion))

      if (res.ok) {
        let result: EditableVersion
        if (res.status !== 204) {
          const json = await res.json()
          result = json as EditableVersion
        } else {
          result = {
            ...values,
          } as EditableVersion
        }

        setVersion(result)
        setSubmitting(false)
        onVersionEdited(result)
      } else {
        setSubmitting(false)
        handleApiError(res, setFieldError)
      }
    },
  })

  if (submitRef) {
    submitRef.current = formik.submitForm
  }

  const [versionHint, setVersionHint] = useVersionHint(version.name)

  const onVersionChange = (value: string) => {
    formik.setFieldValue('name', value, true)
    setVersionHint(value)
  }

  return (
    <DyoCard className={className}>
      <DyoHeading element="h4" className="text-lg text-bright">
        {editing ? t('common:editName', { name: version.name }) : t('new')}
      </DyoHeading>

      <DyoLabel className="text-light">{t('tips')}</DyoLabel>

      <form className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
        <DyoInput
          className="max-w-lg"
          grow
          name="name"
          type="name"
          required
          label={t('common:name')}
          onChange={e => {
            onVersionChange(e.currentTarget.value)
          }}
          value={formik.values.name}
          message={versionHint ?? formik.errors.name}
          messageType={versionHint ? 'info' : 'error'}
        />

        <DyoTextArea
          className="h-48"
          grow
          name="changelog"
          label={t('changelog')}
          onChange={formik.handleChange}
          value={formik.values.changelog}
          message={formik.errors.changelog}
        />

        {editing ? null : (
          <>
            <DyoLabel textColor="mt-8 mb-2.5 text-light-eased">{t('type')}</DyoLabel>
            <DyoChips
              className="text-bright"
              choices={VERSION_TYPE_VALUES}
              initialSelection={formik.values.type}
              converter={it => t(it)}
              onSelectionChange={type => {
                formik.setFieldValue('type', type, false)
              }}
            />
          </>
        )}

        <DyoButton className="hidden" type="submit" />
      </form>
    </DyoCard>
  )
}

export default EditVersionCard
