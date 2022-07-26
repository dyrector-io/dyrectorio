import { Layout, PageHead } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DyoButton } from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import {
  ROUTE_SETTINGS,
  ROUTE_SETTINGS_CHANGE_PASSWORD,
  ROUTE_SETTINGS_EDIT_PROFILE,
  ROUTE_VERIFICATION,
} from '@app/routes'
import { redirectTo, withContextAuthorization } from '@app/utils'
import { Identity } from '@ory/kratos-client'
import { sessionOfContext } from '@server/kratos'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import Link from 'next/link'

const SettingsPage = (props: Identity) => {
  const { t } = useTranslation('settings')

  const labelClass = 'text-right mr-2 mt-2'
  const valueClass = 'mt-2'

  const pageLink: BreadcrumbLink = {
    name: t('common:settings'),
    url: ROUTE_SETTINGS,
  }

  return (
    <>
      <PageHead title={t('title')} />
      <Layout>
        <PageHeading pageLink={pageLink}>
          <div className="ml-auto">
            <Link href={ROUTE_SETTINGS_EDIT_PROFILE} passHref>
              <DyoButton>{t('editProfile')}</DyoButton>
            </Link>

            <Link href={ROUTE_SETTINGS_CHANGE_PASSWORD} passHref>
              <DyoButton>{t('changePass')}</DyoButton>
            </Link>
          </div>
        </PageHeading>

        <DyoCard className="text-bright px-8 py-6">
          <DyoHeading element="h2" className="text-2xl">
            {t('profile')}
          </DyoHeading>

          <div className="flex flex-row">
            <div className="flex flex-col items-right">
              <DyoLabel className={labelClass}>{t('common:email')}</DyoLabel>
              <DyoLabel className={labelClass}>{t('firstName')}</DyoLabel>
              <DyoLabel className={labelClass}>{t('lastName')}</DyoLabel>
            </div>

            <div className="flex flex-col">
              <p className={valueClass}>{props.traits.email}</p>
              <p className={valueClass}>{props.traits.name?.first}</p>
              <p className={valueClass}>{props.traits.name?.last}</p>
            </div>
          </div>
        </DyoCard>
      </Layout>
    </>
  )
}

export default SettingsPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const session = sessionOfContext(context)

  const identity = session.identity
  const email = identity.traits.email
  const verifiable = identity.verifiable_addresses?.filter(it => it.value === email && !it.verified)

  if ((verifiable?.length ?? 0) > 0) {
    const address = verifiable[0]

    return redirectTo(`${ROUTE_VERIFICATION}?email=${address.value}`)
  }

  return {
    props: identity,
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
