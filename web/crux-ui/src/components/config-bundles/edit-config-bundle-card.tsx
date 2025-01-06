import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoTextArea from '@app/elements/dyo-text-area'
import { defaultApiErrorHandler } from '@app/errors'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import { SubmitHook } from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { ConfigBundleDetails, CreateConfigBundle, PatchConfigBundle } from '@app/models'
import { sendForm } from '@app/utils'
import { configBundleSchema } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'

type EditConfigBundleCardProps = {
  className?: string
  configBundle?: ConfigBundleDetails
  onConfigBundleEdited: (configBundle: ConfigBundleDetails) => void
  submit: SubmitHook
}

const EditConfigBundleCard = (props: EditConfigBundleCardProps) => {
  const { className, configBundle, onConfigBundleEdited, submit } = props

  const { t } = useTranslation('config-bundles')
  const routes = useTeamRoutes()

  const [bundle, setBundle] = useState<ConfigBundleDetails>(
    configBundle ?? {
      id: null,
      name: null,
      description: null,
      config: {
        id: null,
        type: 'config-bundle',
      },
    },
  )

  const editing = !!bundle.id

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useDyoFormik({
    submit,
    initialValues: bundle,
    validationSchema: configBundleSchema,
    t,
    onSubmit: async (values, { setFieldError }) => {
      const body: CreateConfigBundle | PatchConfigBundle = {
        ...values,
      }

      const res = await (!editing
        ? sendForm('POST', routes.configBundle.api.list(), body)
        : sendForm('PATCH', routes.configBundle.api.details(bundle.id), body))

      if (res.ok) {
        let result: ConfigBundleDetails
        if (res.status !== 204) {
          result = (await res.json()) as ConfigBundleDetails
        } else {
          result = values
        }

        setBundle(result)
        onConfigBundleEdited(result)
      } else {
        await handleApiError(res, setFieldError)
      }
    },
  })

  return (
    <DyoCard className={className}>
      <DyoHeading element="h4" className="text-lg text-bright">
        {t(!editing ? 'new' : 'common:editName', configBundle)}
      </DyoHeading>

      <DyoLabel textColor="text-bright-muted">{t('tips')}</DyoLabel>

      <DyoForm className="grid grid-cols-2 gap-8" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
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

          <DyoTextArea
            className="h-48"
            grow
            name="description"
            label={t('common:description')}
            onChange={formik.handleChange}
            value={formik.values.description}
          />
        </div>

        <DyoButton className="hidden" type="submit" />
      </DyoForm>
    </DyoCard>
  )
}

export default EditConfigBundleCard
