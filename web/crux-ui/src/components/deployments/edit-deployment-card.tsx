import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoIcon from '@app/elements/dyo-icon'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoLink from '@app/elements/dyo-link'
import DyoMultiSelect from '@app/elements/dyo-multi-select'
import DyoTextArea from '@app/elements/dyo-text-area'
import DyoToggle from '@app/elements/dyo-toggle'
import { defaultApiErrorHandler } from '@app/errors'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import { SubmitHook } from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { ConfigBundle, Deployment, DeploymentDetails, detailsToConfigBundle, UpdateDeployment } from '@app/models'
import { fetcher, sendForm } from '@app/utils'
import { updateDeploymentSchema } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import useSWR from 'swr'

type EditableDeployment = Pick<Deployment, 'id' | 'prefix' | 'note' | 'protected'> & {
  configBundles: ConfigBundle[]
}

type EditDeploymentCardProps = {
  className?: string
  deployment: DeploymentDetails
  submit: SubmitHook
  onDeploymentEdited: (deployment: DeploymentDetails) => void
}

const EditDeploymentCard = (props: EditDeploymentCardProps) => {
  const { deployment: propsDeployment, className, onDeploymentEdited, submit } = props

  const deployment: EditableDeployment = {
    ...propsDeployment,
    configBundles: propsDeployment.configBundles.map(it => detailsToConfigBundle(it)),
  }

  const { t } = useTranslation('deployments')
  const routes = useTeamRoutes()

  const handleApiError = defaultApiErrorHandler(t)

  const { data: configBundles, error: configBundlesError } = useSWR<ConfigBundle[]>(
    routes.configBundle.api.list(),
    fetcher,
  )

  const formik = useDyoFormik({
    submit,
    initialValues: deployment,
    validationSchema: updateDeploymentSchema,
    t,
    onSubmit: async (values, { setFieldError }) => {
      const body: UpdateDeployment = {
        ...values,
        configBundles: values.configBundles.map(it => it.id),
      }

      let res = await sendForm('PUT', routes.deployment.api.details(deployment.id), body)

      if (res.ok) {
        res = await fetch(routes.deployment.api.details(deployment.id))
        if (res.ok) {
          const deploy: DeploymentDetails = await res.json()

          onDeploymentEdited(deploy)
          return
        }
      }
      await handleApiError(res, setFieldError)
    },
  })

  const configBundlesHref =
    deployment.configBundles?.length === 1
      ? routes.configBundle.details(deployment.configBundles[0].id)
      : routes.configBundle.list()

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

        <DyoLabel className="text-bright mt-8 mb-2">{t('configBundle')}</DyoLabel>

        {!configBundlesError && (
          <div className="flex flex-row">
            <DyoMultiSelect
              name="configBundles"
              className="ml-2"
              choices={configBundles ?? []}
              selection={formik.values.configBundles}
              onSelectionChange={async it => {
                await formik.setFieldValue('configBundles', it)
              }}
            />

            <DyoLink className="ml-2 my-auto" href={configBundlesHref} qaLabel="config-bundle-view-icon">
              <DyoIcon src="/eye.svg" alt={t('common:view')} size="md" />
            </DyoLink>
          </div>
        )}

        <DyoButton className="hidden" type="submit" />
      </DyoForm>
    </DyoCard>
  )
}

export default EditDeploymentCard
