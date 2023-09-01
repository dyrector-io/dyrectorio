import ShEditor from '@app/components/shared/sh-editor'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoChips from '@app/elements/dyo-chips'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoIcon from '@app/elements/dyo-icon'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import { defaultApiErrorHandler } from '@app/errors'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { CreateDeploymentToken, DeploymentDetails, DeploymentToken, DeploymentTokenCreated } from '@app/models'
import { apiDocsUrl } from '@app/routes'
import { sendForm, writeToClipboard } from '@app/utils'
import { createDeploymentTokenSchema } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import { MutableRefObject, useEffect, useState } from 'react'

const EXPIRATION_VALUES = [30, 60, 90, null]

type CreateDeploymentTokenCardProps = {
  className?: string
  submitRef?: MutableRefObject<() => Promise<any>>
  deployment: DeploymentDetails
  onTokenCreated: (token: DeploymentToken) => void
  onDiscard: VoidFunction
}

const CreateDeploymentTokenCard = (props: CreateDeploymentTokenCardProps) => {
  const { className, submitRef, deployment, onTokenCreated, onDiscard } = props

  const { t } = useTranslation('deployments')
  const routes = useTeamRoutes()

  const [token, setToken] = useState<DeploymentTokenCreated>(null)

  const onClose = () => {
    delete token.curl
    delete token.token

    onTokenCreated(token)
  }

  const onCopyCurl = () => writeToClipboard(t, token.curl)

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useDyoFormik(
    {
      validationSchema: createDeploymentTokenSchema,
      initialValues: {
        name: '',
        expirationInDays: EXPIRATION_VALUES[0],
      } as CreateDeploymentToken,
      onSubmit: async (values, { setSubmitting, setFieldError }) => {
        setSubmitting(true)

        const res = await sendForm('PUT', routes.deployment.api.token(deployment.id), values as CreateDeploymentToken)

        if (res.ok) {
          const json = await res.json()
          const result = json as DeploymentTokenCreated

          setSubmitting(false)
          setToken(result)
        } else {
          setSubmitting(false)
          handleApiError(res, setFieldError)
        }
      },
    },
    submitRef,
  )

  return (
    <DyoCard className={className}>
      <div className="flex flex-row">
        <DyoHeading element="h4" className="text-xl text-bright">
          {!token ? t('tokens:newToken') : token.name}
        </DyoHeading>

        {!token ? (
          <>
            <DyoButton outlined secondary className="ml-auto mr-2 px-10" onClick={onDiscard}>
              {t('common:discard')}
            </DyoButton>

            <DyoButton outlined className="ml-2 px-10" onClick={() => formik.submitForm()}>
              {t('common:create')}
            </DyoButton>
          </>
        ) : (
          <DyoButton outlined secondary className="ml-auto mb-2 mr-2 px-10" onClick={onClose}>
            {t('common:close')}
          </DyoButton>
        )}
      </div>

      {!token ? (
        <DyoForm className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
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

          <DyoLabel textColor="mt-8 mb-2.5 text-light-eased">{t('tokens:expirationIn')}</DyoLabel>

          <DyoChips
            className="text-bright"
            choices={EXPIRATION_VALUES}
            selection={formik.values.expirationInDays}
            converter={it => (it ? t('common:days', { days: it }) : t('common:never'))}
            onSelectionChange={it => {
              formik.setFieldValue('expirationInDays', it, false)
            }}
          />

          <DyoButton className="hidden" type="submit" />
        </DyoForm>
      ) : (
        <>
          <p className="text-bright mb-4">{t('deployTokenIsReady')}</p>

          <div className="flex flex-row gap-2 mb-4 mt-2">
            <DyoInput
              containerClassName="flex-1"
              className="overflow-x-auto"
              grow
              readOnly
              defaultValue={token.curl}
              onFocus={ev => ev.target.select()}
            />

            <DyoIcon
              className="cursor-pointer self-center"
              size="md"
              src="/copy-alt.svg"
              alt={t('common:copy')}
              onClick={onCopyCurl}
            />
          </div>

          <DyoHeading element="h4" className="text-xl text-bright mt-8">
            {t('jwtToken')}
          </DyoHeading>

          <div className="flex flex-wrap gap-2 text-bright items-center">
            <span>{t('toTriggerTheDeploy')}</span>

            <span className="ring-2 ring-light-grey-muted rounded-md focus:outline-none align-middle p-1">
              {routes.deployment.api.start(deployment.id)}
            </span>

            <span>{t('youMustPutTheBearer')}</span>

            <span>
              {t('youCanSelectSpecificInstances')}
              <a
                className="pl-1 underline"
                target="_blank"
                rel="noreferrer"
                href={apiDocsUrl({ anchor: 'api-deployments-deploymentid-start' })}
              >
                {t('clickHereForMoreInfo')}
              </a>
            </span>
          </div>

          <ShEditor className="h-26 p-2 mb-4 mt-2 w-full overflow-x-auto" readOnly value={token.token} />
        </>
      )}
    </DyoCard>
  )
}

export default CreateDeploymentTokenCard
