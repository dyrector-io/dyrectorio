import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoChips from '@app/elements/dyo-chips'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoTextArea from '@app/elements/dyo-text-area'
import { defaultApiErrorHandler } from '@app/errors'
import { ProductType, PRODUCT_TYPE_VALUES } from '@app/models'
import { CreateEntityResponse } from '@app/models/grpc/protobuf/proto/crux'
import { ApplyTemplate, Template } from '@app/models/template'
import { API_TEMPLATES } from '@app/routes'
import { sendForm } from '@app/utils'
import { applyTemplateSchema } from '@app/validations'
import { useFormik } from 'formik'
import useTranslation from 'next-translate/useTranslation'
import { MutableRefObject } from 'react'

interface ApplyTemplateCardProps {
  className?: string
  template: Template
  onTemplateApplied: (productId: string) => void
  submitRef?: MutableRefObject<() => Promise<any>>
}

const ApplyTemplateCard = (props: ApplyTemplateCardProps) => {
  const { template: propsTemplate, className, onTemplateApplied, submitRef } = props

  const { t } = useTranslation('templates')

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useFormik({
    validationSchema: applyTemplateSchema,
    initialValues: {
      name: propsTemplate.name,
      description: propsTemplate.description,
      type: 'simple' as ProductType,
    },
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setSubmitting(true)

      const body: ApplyTemplate = {
        id: propsTemplate.id,
        ...values,
      }

      const res = await sendForm('POST', API_TEMPLATES, body)

      if (res.ok) {
        const json = await res.json()
        const result = json as CreateEntityResponse

        setSubmitting(false)
        onTemplateApplied(result.id)
      } else {
        setSubmitting(false)
        handleApiError(res, setFieldError)
      }
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
      <DyoForm className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
        <DyoInput
          className="max-w-lg"
          grow
          name="name"
          type="name"
          required
          label={t('productName')}
          onChange={formik.handleChange}
          value={formik.values.name}
          message={formik.errors.name}
        />

        <DyoTextArea
          className="h-48"
          grow
          name="description"
          label={t('description')}
          onChange={formik.handleChange}
          value={formik.values.description}
        />

        <DyoLabel textColor="mt-8 mb-2.5 text-light-eased">{t('type')}</DyoLabel>
        <DyoChips
          className="text-bright"
          choices={PRODUCT_TYPE_VALUES}
          initialSelection={formik.values.type}
          converter={it => t(`products:${it}`)}
          onSelectionChange={type => {
            formik.setFieldValue('type', type, false)
          }}
        />

        <DyoButton className="hidden" type="submit" />
      </DyoForm>
    </DyoCard>
  )
}

export default ApplyTemplateCard
