import { Layout } from '@app/components/layout'
import OidcConnector, { OidcConnectorAction } from '@app/components/settings/oidc-connector'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { HEADER_LOCATION } from '@app/const'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoMessage from '@app/elements/dyo-message'
import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import DyoToggle from '@app/elements/dyo-toggle'
import { defaultApiErrorHandler } from '@app/errors'
import useConfirmation from '@app/hooks/use-confirmation'
import { IdentityPublicMetadata, oidcEnabled, OidcProvider } from '@app/models'
import {
  API_SETTINGS_OIDC,
  API_USERS_ME_PREFERENCES_ONBOARDING,
  ROUTE_LOGIN,
  ROUTE_NEW_PASSWORD,
  ROUTE_SETTINGS,
  ROUTE_SETTINGS_CHANGE_PASSWORD,
  ROUTE_SETTINGS_EDIT_PROFILE,
  ROUTE_SETTINGS_TOKENS,
  verificationUrl,
} from '@app/routes'
import { findAttributesByValue, mapOidcAvailability, redirectTo, sendForm, withContextAuthorization } from '@app/utils'
import { Identity, SettingsFlow, UiContainer } from '@ory/kratos-client'
import kratos, { cookieOf, identityWasRecovered, sessionOfContext } from '@server/kratos'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useState } from 'react'

type SettingsPageProps = {
  identity: Identity
  flow: SettingsFlow
}

const mapUiToOidcProviders = (ui: UiContainer): Record<OidcProvider, OidcConnectorAction> => ({
  gitlab: findAttributesByValue(ui, 'gitlab')?.name as OidcConnectorAction,
  github: findAttributesByValue(ui, 'github')?.name as OidcConnectorAction,
  google: findAttributesByValue(ui, 'google')?.name as OidcConnectorAction,
  azure: findAttributesByValue(ui, 'azure')?.name as OidcConnectorAction,
})

const SettingsPage = (props: SettingsPageProps) => {
  const { t } = useTranslation('settings')
  const router = useRouter()

  const { flow } = props
  const { identity } = flow
  const { traits, metadata_public: propsPublicMetadata } = identity

  const handleApiError = defaultApiErrorHandler(t)

  const metadata = propsPublicMetadata as IdentityPublicMetadata
  const [onboardingDisabled, setOnboardingDisabled] = useState(metadata?.disableOnboarding ?? false)
  const [modalConfig, confirm] = useConfirmation()
  const [ui, setUi] = useState<UiContainer>(flow.ui)

  const oidc = mapOidcAvailability(ui)
  const oidcActions = mapUiToOidcProviders(ui)

  const onToggleOnboarding = async () => {
    const res = await fetch(API_USERS_ME_PREFERENCES_ONBOARDING, { method: onboardingDisabled ? 'PUT' : 'DELETE' })
    if (!res.ok) {
      handleApiError(res)
      return
    }

    setOnboardingDisabled(!onboardingDisabled)
  }

  const onModifyOidcConnection = async (provider: OidcProvider, action: OidcConnectorAction) => {
    if (action === 'unlink') {
      const confirmed = await confirm(null, {
        title: t('common:areYouSure'),
        description: t('areYouSureWantToRemoveAccount', {
          account: provider,
        }),
        confirmText: t('remove'),
        confirmColor: 'bg-error-red',
      })

      if (!confirmed) {
        return
      }
    }

    const res = await sendForm(action === 'link' ? 'POST' : 'DELETE', API_SETTINGS_OIDC, {
      flow: flow.id,
      provider,
    })

    if (!res.ok) {
      if (res.status === 403) {
        await router.replace(`${ROUTE_LOGIN}?refresh=${encodeURIComponent(identity.traits.email)}`)
        return
      }

      if (res.status === 410) {
        router.reload()
        return
      }

      handleApiError(res)
      return
    }

    if (res.status === 201) {
      const url = res.headers.get(HEADER_LOCATION)
      await router.push(url)
      return
    }

    const newFlow = (await res.json()) as SettingsFlow
    setUi(newFlow.ui)
  }

  const pageLink: BreadcrumbLink = {
    name: t('common:profile'),
    url: ROUTE_SETTINGS,
  }

  return (
    <Layout title={t('common:profile')}>
      <PageHeading pageLink={pageLink}>
        <DyoButton href={ROUTE_SETTINGS_TOKENS}>{t('profileToken')}</DyoButton>

        <DyoButton href={ROUTE_SETTINGS_EDIT_PROFILE}>{t('editProfile')}</DyoButton>

        <DyoButton href={ROUTE_SETTINGS_CHANGE_PASSWORD}>{t('changePass')}</DyoButton>
      </PageHeading>

      <DyoCard className="flex flex-col text-bright p-8">
        <DyoHeading element="h2" className="text-2xl">
          {t('profile')}
        </DyoHeading>

        <DyoLabel textColor="text-bright-muted">{t('tips')}</DyoLabel>

        <div className="flex flex-row gap-32">
          <div className="flex flex-col w-1/2">
            <DyoInput
              label={t('common:firstName')}
              name="firstName"
              type="text"
              defaultValue={traits.name?.first}
              disabled
              grow
            />

            <DyoInput
              label={t('common:lastName')}
              name="lastName"
              type="text"
              defaultValue={traits.name?.last}
              disabled
              grow
            />

            <DyoInput label={t('common:email')} name="email" type="email" defaultValue={traits.email} disabled grow />

            <DyoToggle
              className="mt-8"
              nameChecked={t('onboarding')}
              nameUnchecked={t('onboarding')}
              checked={!onboardingDisabled}
              onCheckedChange={onToggleOnboarding}
            />
          </div>

          {oidcEnabled(oidc) && (
            <div className="grid grid-cols-2 items-center gap-4 mt-14">
              <OidcConnector
                provider="gitlab"
                name="Gitlab"
                action={oidcActions.gitlab}
                onModifyConnection={onModifyOidcConnection}
              />

              <OidcConnector
                provider="github"
                name="Github"
                action={oidcActions.github}
                onModifyConnection={onModifyOidcConnection}
              />

              <OidcConnector
                provider="google"
                name="Google"
                action={oidcActions.google}
                onModifyConnection={onModifyOidcConnection}
              />

              <OidcConnector
                provider="azure"
                name="Azure"
                action={oidcActions.azure}
                onModifyConnection={onModifyOidcConnection}
              />

              {ui.messages?.map((it, index) => (
                <DyoMessage
                  className="col-span-2 text-xs italic"
                  key={`info-${index}`}
                  message={it?.text}
                  messageType="info"
                />
              ))}
            </div>
          )}
        </div>
      </DyoCard>

      <DyoConfirmationModal config={modalConfig} />
    </Layout>
  )
}

export default SettingsPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const flowId = context.query.flow as string

  const session = sessionOfContext(context)
  const { identity } = session

  if (identityWasRecovered(session)) {
    return redirectTo(`${ROUTE_NEW_PASSWORD}?flow=${flowId}`)
  }

  const { email } = identity.traits
  const verifiable = identity.verifiable_addresses?.find(it => it.value === email && !it.verified)

  if (verifiable) {
    return redirectTo(verificationUrl(verifiable.value))
  }

  const cookie = cookieOf(context.req)
  const flow = flowId
    ? await kratos.getSettingsFlow({
        id: flowId,
        cookie: cookieOf(context.req),
      })
    : await kratos.createBrowserSettingsFlow({
        cookie,
      })

  return {
    props: {
      flow: flow.data,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
