import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import DyoTextArea from '@app/elements/dyo-text-area'
import DyoToggle from '@app/elements/dyo-toggle'
import { defaultApiErrorHandler } from '@app/errors'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { DeploymentDetails, PatchDeployment } from '@app/models'
import { sendForm } from '@app/utils'
import { updateDeploymentSchema } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import React from 'react'

interface EditDeploymentCardProps {
  className?: string
  deployment: DeploymentDetails
  submitRef: React.MutableRefObject<() => Promise<any>>
  onDeploymentEdited: (deployment: DeploymentDetails) => void
}

const EditDeploymentCard = (props: EditDeploymentCardProps) => {
  const { deployment, className, onDeploymentEdited, submitRef } = props

  const { t } = useTranslation('deployments')
  const routes = useTeamRoutes()

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useDyoFormik({
    initialValues: deployment,
    validationSchema: updateDeploymentSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setSubmitting(true)

      const transformedValues = updateDeploymentSchema.cast(values) as any

      const body: PatchDeployment = {
        ...transformedValues,
      }

      const res = await sendForm('PATCH', routes.deployment.api.details(deployment.id), body)

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

        <DyoToggle
          className="mt-8 mb-2.5"
          name="protected"
          label={t('protected')}
          checked={formik.values.protected}
          setFieldValue={formik.setFieldValue}
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
