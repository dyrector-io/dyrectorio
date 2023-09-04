import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import DyoTextArea from '@app/elements/dyo-text-area'
import { defaultApiErrorHandler } from '@app/errors'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { ConfigBundle, CreateConfigBundle } from '@app/models'
import { sendForm } from '@app/utils'
import { configBundleCreateSchema } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import { MutableRefObject } from 'react'

interface AddConfigBundleCardProps {
  className?: string
  configBundle?: ConfigBundle
  onCreated: (configBundle: ConfigBundle) => void
  submitRef: MutableRefObject<() => Promise<any>>
}

const AddConfigBundleCard = (props: AddConfigBundleCardProps) => {
  const { className, configBundle: propsConfigBundle, onCreated, submitRef } = props

  const { t } = useTranslation('config-bundles')
  const routes = useTeamRoutes()

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useDyoFormik({
    initialValues: {
      name: propsConfigBundle?.name ?? '',
      description: propsConfigBundle?.description ?? '',
    },
    validationSchema: configBundleCreateSchema,
    t,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setSubmitting(true)

      const body: CreateConfigBundle = {
        ...values,
      }

      const res = await sendForm('POST', routes.configBundles.api.list(), body)

      if (res.ok) {
        let result: ConfigBundle
        if (res.status !== 204) {
          result = (await res.json()) as ConfigBundle
        } else {
          result = {
            id: propsConfigBundle.id,
            ...values,
          }
        }

        setSubmitting(false)
        onCreated(result)
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
        {t('new')}
      </DyoHeading>

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

export default AddConfigBundleCard
