import { DyoButton } from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoTextArea } from '@app/elements/dyo-text-area'
import { defaultApiErrorHandler } from '@app/errors'
import { DeploymentRoot, UpdateDeployment, UpdateProduct } from '@app/models'
import { deploymentApiUrl } from '@app/routes'
import { sendForm } from '@app/utils'
import { updateDeploymentSchema } from '@app/validation'
import { useFormik } from 'formik'
import useTranslation from 'next-translate/useTranslation'
import React from 'react'

interface EditDeploymentCardProps {
  className?: string
  deployment: DeploymentRoot
  submitRef: React.MutableRefObject<() => Promise<any>>
  onDeploymentEdited: (deployment: DeploymentRoot) => void
}

const EditDeploymentCard = (props: EditDeploymentCardProps) => {
  const { t } = useTranslation('deployments')

  const { deployment } = props

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useFormik({
    initialValues: props.deployment,
    validationSchema: updateDeploymentSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setSubmitting(true)

      const body: UpdateDeployment = {
        ...values,
      }

      const res = await sendForm(
        'PUT',
        deploymentApiUrl(deployment.product.id, deployment.versionId, deployment.id),
        body as UpdateProduct,
      )

      if (res.ok) {
        props.onDeploymentEdited({
          ...deployment,
          ...values,
        })
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
    <DyoCard className={props.className}>
      <DyoHeading element="h4" className="text-lg text-bright">
        {t('common:editName', { name: deployment.name })}
      </DyoHeading>

      <form className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
        <DyoInput
          className="max-w-lg"
          grow
          name="name"
          required
          label={t('common:name')}
          onChange={formik.handleChange}
          value={formik.values.name}
          message={formik.errors.name}
        />

        <DyoTextArea
          className="h-48"
          grow
          name="description"
          label={t('common:description')}
          onChange={formik.handleChange}
          value={formik.values.description}
        />

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

        <DyoButton className="hidden" type="submit"></DyoButton>
      </form>
    </DyoCard>
  )
}

export default EditDeploymentCard
