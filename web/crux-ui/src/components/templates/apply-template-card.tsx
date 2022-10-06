import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { defaultApiErrorHandler } from '@app/errors'
import { CreateEntityResponse } from '@app/models/grpc/protobuf/proto/crux'
import { ApplyTemplate, Template } from '@app/models/template'
import { API_TEMPLATES, productUrl } from '@app/routes'
import { sendForm } from '@app/utils'
import { applyTemplateSchema } from '@app/validations'
import { useFormik } from 'formik'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { MutableRefObject } from 'react'

interface ApplyTemplateCardProps {
  className?: string
  template: Template
  onTemplateApplied: () => void
  submitRef?: MutableRefObject<() => Promise<any>>
}

const ApplyTemplateCard = (props: ApplyTemplateCardProps) => {
  const { template: propsTemplate, className, onTemplateApplied, submitRef } = props

  const { t } = useTranslation('templates')
  const router = useRouter()

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useFormik({
    validationSchema: applyTemplateSchema,
    initialValues: {
      productName: propsTemplate.name,
    },
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setSubmitting(true)

      const body: ApplyTemplate = {
        id: propsTemplate.id,
        ...values,
      }

      const res = await sendForm('POST', API_TEMPLATES, body)

      if (res.ok) {
        onTemplateApplied()

        const json = await res.json()
        const result = json as CreateEntityResponse

        router.push(productUrl(result.id))
      } else {
        handleApiError(res, setFieldError)
      }

      setSubmitting(false)
    },
  })

  if (submitRef) {
    submitRef.current = formik.submitForm
  }

  return (
    <DyoCard className={className}>
      <DyoHeading element="h4" className="text-lg text-bright">
        {t('applyTemplate', { name: propsTemplate.name })}
      </DyoHeading>

      <form className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
        <DyoInput
          className="max-w-lg"
          grow
          name="productName"
          type="productName"
          required
          label={t('productName')}
          onChange={formik.handleChange}
          value={formik.values.productName}
          message={formik.errors.productName}
        />

        <DyoButton className="hidden" type="submit" />
      </form>
    </DyoCard>
  )
}

export default ApplyTemplateCard
