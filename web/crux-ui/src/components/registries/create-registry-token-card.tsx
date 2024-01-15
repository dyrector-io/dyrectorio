import ShEditor from '@app/components/shared/sh-editor'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoChips, { chipsQALabelFromValue } from '@app/elements/dyo-chips'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import { defaultApiErrorHandler } from '@app/errors'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import { SubmitHook } from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { CreateRegistryToken, RegistryDetails, RegistryToken, RegistryTokenCreated } from '@app/models'
import { sendForm } from '@app/utils'
import { createRegistryTokenSchema } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'

const EXPIRATION_VALUES = [30, 60, 90, null]

type CreateRegistryTokenCardProps = {
  className?: string
  submit?: SubmitHook
  registry: RegistryDetails
  onTokenCreated: (token: RegistryToken) => void
  onDiscard: VoidFunction
}

const CreateRegistryTokenCard = (props: CreateRegistryTokenCardProps) => {
  const { className, submit, registry, onTokenCreated, onDiscard } = props

  const { t } = useTranslation('registries')
  const routes = useTeamRoutes()

  const [token, setToken] = useState<RegistryTokenCreated>(null)

  const onClose = () => {
    delete token.config
    delete token.token

    onTokenCreated(token)
  }

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useDyoFormik({
    submit,
    validationSchema: createRegistryTokenSchema,
    t,
    initialValues: {
      expirationInDays: EXPIRATION_VALUES[0],
    } as CreateRegistryToken,
    onSubmit: async (values, { setFieldError }) => {
      const res = await sendForm('PUT', routes.registry.api.token(registry.id), values as RegistryTokenCreated)

      if (res.ok) {
        const json = await res.json()
        const result = json as RegistryTokenCreated

        setToken(result)
      } else {
        await handleApiError(res, setFieldError)
      }
    },
  })

  return (
    <DyoCard className={className}>
      <div className="flex flex-row">
        <DyoHeading element="h4" className="text-xl text-bright">
          {t('tokens:newToken')}
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
          <DyoLabel textColor="mt-8 mb-2.5 text-light-eased">{t('tokens:expirationIn')}</DyoLabel>

          <DyoChips
            name="expiration"
            className="text-bright"
            choices={EXPIRATION_VALUES}
            selection={formik.values.expirationInDays}
            converter={it => (it ? t('common:days', { days: it }) : t('common:never'))}
            onSelectionChange={async (it): Promise<void> => {
              await formik.setFieldValue('expirationInDays', it, false)
            }}
            qaLabel={(name, choice) => chipsQALabelFromValue(name, choice?.toString())}
          />

          <DyoButton className="hidden" type="submit" />
        </DyoForm>
      ) : (
        <>
          <p className="text-bright mb-4">{t('tokenIsReady')}</p>

          <DyoHeading element="h4" className="text-xl text-bright mt-8">
            {t('tokens:jwtToken')}
          </DyoHeading>

          <ShEditor className="h-26 p-2 mb-4 mt-2 w-full overflow-x-auto" readOnly value={token.token} />

          <div className="flex flex-wrap gap-2 text-bright items-center mt-8">
            <span>{t('toUseTheTokenInV2')}</span>

            <ShEditor className="h-26 p-2 mb-4 mt-2 w-full overflow-x-auto" readOnly value={token.config} />

            <span>
              {t('readMoreAboutV2')}
              <a
                className="pl-1 underline"
                target="_blank"
                rel="noreferrer"
                href="https://distribution.github.io/distribution/about/configuration/"
              >
                {t('common:clickHereForMoreInfo')}
              </a>
            </span>
          </div>
        </>
      )}
    </DyoCard>
  )
}

export default CreateRegistryTokenCard
