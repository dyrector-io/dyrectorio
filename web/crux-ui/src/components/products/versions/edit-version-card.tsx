import { DyoButton } from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import { DyoTextArea } from '@app/elements/dyo-text-area'
import { DyoToggle } from '@app/elements/dyo-toggle'
import { defaultApiErrorHandler } from '@app/errors'
import { CreateVersion, Product, UpdateVersion, Version, VersionType } from '@app/models'
import { productVersionsApiUrl, versionApiUrl } from '@app/routes'
import { formikFieldValueConverter, sendForm } from '@app/utils'
import { createVersionSchema, updateVersionSchema } from '@app/validation'
import { useFormik } from 'formik'
import useTranslation from 'next-translate/useTranslation'
import { MutableRefObject, useState } from 'react'

interface EditVersionCardProps {
  className?: string
  product: Product
  version?: Version
  onVersionEdited: (version: Version) => void
  submitRef?: MutableRefObject<() => Promise<any>>
}

const EditVersionCard = (props: EditVersionCardProps) => {
  const { t } = useTranslation('versions')

  const { product } = props

  const [version, setVersion] = useState<Version>(
    props.version ?? {
      id: null,
      name: '',
      changelog: '',
      default: false,
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
        let result: Version
        if (res.status != 204) {
          const json = await res.json()
          result = json as Version
        } else {
          result = {
            ...values,
          } as Version
        }

        setVersion(result)
        props.onVersionEdited(result)
      } else {
        handleApiError(res, setFieldError)
      }

      setSubmitting(false)
    },
  })

  if (props.submitRef) {
    props.submitRef.current = formik.submitForm
  }

  return (
    <>
      <DyoCard className={props.className}>
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
            onChange={formik.handleChange}
            value={formik.values.name}
            message={formik.errors.name}
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
            <div className="mr-auto">
              <DyoToggle
                className="text-bright mt-8"
                name="type"
                nameChecked={t('incremental')}
                nameUnchecked={t('rolling')}
                checked={formik.values.type === 'incremental'}
                setFieldValue={formikFieldValueConverter<VersionType>(formik, it => (it ? 'incremental' : 'rolling'))}
              />
            </div>
          )}

          <div className="mr-auto">
            <DyoToggle
              className="text-bright mt-8"
              name="default"
              nameChecked={t('default')}
              nameUnchecked={t('default')}
              checked={formik.values.default}
              setFieldValue={formik.setFieldValue}
            />
          </div>

          <DyoButton className="hidden" type="submit"></DyoButton>
        </form>
      </DyoCard>
    </>
  )
}

export default EditVersionCard
