import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoTextArea from '@app/elements/dyo-text-area'
import { defaultApiErrorHandler } from '@app/errors'
import useVersionHint from '@app/hooks/use-version-hint'
import { IncreaseVersion, Product, Version } from '@app/models'
import { versionIncreaseApiUrl } from '@app/routes'
import { sendForm } from '@app/utils'
import { increaseVersionSchema } from '@app/validations'
import { useFormik } from 'formik'
import useTranslation from 'next-translate/useTranslation'
import { MutableRefObject } from 'react'

interface IncreaseVersionCardProps {
  className?: string
  product: Product
  parent: Version
  onVersionIncreased: (version: Version) => void
  submitRef?: MutableRefObject<() => Promise<any>>
}

const IncreaseVersionCard = (props: IncreaseVersionCardProps) => {
  const { className, parent, product, onVersionIncreased, submitRef } = props

  const { t } = useTranslation('versions')

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useFormik({
    validationSchema: increaseVersionSchema,
    initialValues: {
      name: '',
      changelog: '',
    },
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setSubmitting(true)

      const body: IncreaseVersion = values

      const res = await sendForm('POST', versionIncreaseApiUrl(product.id, parent.id), body)

      if (res.ok) {
        const result = (await res.json()) as Version
        setSubmitting(false)
        onVersionIncreased(result)
      } else {
        setSubmitting(false)
        handleApiError(res, setFieldError)
      }
    },
  })

  if (submitRef) {
    submitRef.current = formik.submitForm
  }

  const [versionHint, setVersionHint] = useVersionHint(null)

  const onVersionChange = (value: string) => {
    formik.setFieldValue('name', value, true)
    setVersionHint(value)
  }

  return (
    <DyoCard className={className}>
      <DyoHeading element="h4" className="text-lg text-bright">
        {t('increaseName', { name: parent.name })}
      </DyoHeading>

      <DyoLabel className="text-light">{t('increaseTips')}</DyoLabel>

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

        <DyoButton className="hidden" type="submit" />
      </form>
    </DyoCard>
  )
}

export default IncreaseVersionCard
