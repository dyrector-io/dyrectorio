import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoToggle from '@app/elements/dyo-toggle'
import { defaultApiErrorHandler } from '@app/errors'
import { IdentityPublicMetadata } from '@app/models'
import {
  API_USERS_ME_PREFERENCES_ONBOARDING,
  ROUTE_NEW_PASSWORD,
  ROUTE_SETTINGS,
  ROUTE_SETTINGS_CHANGE_PASSWORD,
  ROUTE_SETTINGS_EDIT_PROFILE,
  ROUTE_SETTINGS_TOKENS,
  verificationUrl,
} from '@app/routes'
import { redirectTo, withContextAuthorization } from '@app/utils'
import { Identity } from '@ory/kratos-client'
import { sessionOfContext } from '@server/kratos'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'

const SettingsPage = (props: Identity) => {
  const { t } = useTranslation('settings')

  const { traits, metadata_public: propsPublicMetadata } = props

  const handleApiError = defaultApiErrorHandler(t)

  const metadata = propsPublicMetadata as IdentityPublicMetadata
  const [onboardingDisabled, setOnboardingDisabled] = useState(metadata?.disableOnboarding ?? false)

  const onToggleOnboarding = async () => {
    const res = await fetch(API_USERS_ME_PREFERENCES_ONBOARDING, { method: onboardingDisabled ? 'PUT' : 'DELETE' })
    if (!res.ok) {
      handleApiError(res)
      return
    }

    setOnboardingDisabled(!onboardingDisabled)
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

        <div className="flex flex-row">
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
        </div>
      </DyoCard>
    </Layout>
  )
}

export default SettingsPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const { flow } = context.query
  if (flow) {
    return redirectTo(`${ROUTE_NEW_PASSWORD}?flow=${flow}`)
  }

  const session = sessionOfContext(context)

  const { identity } = session
  const { email } = identity.traits
  const verifiable = identity.verifiable_addresses?.find(it => it.value === email && !it.verified)

  if (verifiable) {
    return redirectTo(verificationUrl(verifiable.value))
  }

  return {
    props: identity,
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
