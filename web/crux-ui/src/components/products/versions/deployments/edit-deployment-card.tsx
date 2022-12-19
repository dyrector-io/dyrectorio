import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import DyoTextArea from '@app/elements/dyo-text-area'
import { defaultApiErrorHandler } from '@app/errors'
import { DeploymentDetails, UpdateDeployment } from '@app/models'
import { deploymentApiUrl } from '@app/routes'
import { sendForm } from '@app/utils'
import { updateDeploymentSchema } from '@app/validations'
import { useFormik } from 'formik'
import useTranslation from 'next-translate/useTranslation'
import React from 'react'

interface EditDeploymentCardProps {
  className?: string
  deployment: DeploymentDetails
  productId: string
  submitRef: React.MutableRefObject<() => Promise<any>>
  onDeploymentEdited: (deployment: DeploymentDetails) => void
}

const EditDeploymentCard = (props: EditDeploymentCardProps) => {
  const { deployment, productId, className, onDeploymentEdited, submitRef } = props

  const { t } = useTranslation('deployments')

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useFormik({
    initialValues: deployment,
    validationSchema: updateDeploymentSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setSubmitting(true)

      const transformedValues = updateDeploymentSchema.cast(values) as any

      const body: UpdateDeployment = {
        ...transformedValues,
      }

      const res = await sendForm('PUT', deploymentApiUrl(productId, deployment.versionId, deployment.id), body)

      setSubmitting(false)

      if (res.ok) {
        onDeploymentEdited({
          ...deployment,
          ...transformedValues,
        })
      } else {
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
        {t('common:editName', { name: t('common:deployment') })}
      </DyoHeading>

      <DyoForm className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
        <DyoInput
          className="max-w-lg"
          grow
          name="prefix"
          required
          label={t('common:prefix')}
          onChange={formik.handleChange}
          value={formik.values.prefix}
          message={formik.errors.prefix}
        />

        <DyoTextArea
          className="h-48"
          grow
          name="note"
          label={t('common:note')}
          onChange={formik.handleChange}
          value={formik.values.note}
        />

        <DyoButton className="hidden" type="submit" />
      </DyoForm>
    </DyoCard>
  )
}

export default EditDeploymentCard
