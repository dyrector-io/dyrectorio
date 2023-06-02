import Onboarding from '@app/components/dashboard/onboarding'
import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DyoCard } from '@app/elements/dyo-card'
import DyoIcon from '@app/elements/dyo-icon'
import { DyoLabel } from '@app/elements/dyo-label'
import { defaultApiErrorHandler } from '@app/errors'
import { Dashboard } from '@app/models'
import { API_DASHBOARD, API_USERS_ME_PREFERENCES_ONBOARDING, ROUTE_DASHBOARD } from '@app/routes'
import { fetcher, withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import { identityOnboardingDisabled, obtainSessionFromRequest } from '@server/kratos'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { useState } from 'react'
import useSWR from 'swr'

type DashboardPageProps = {
  dashboard: Dashboard
  onboardingDisabled: boolean
}

const DashboardPage = (props: DashboardPageProps) => {
  const { t, lang } = useTranslation('dashboard')

  const { dashboard: propsDashboard, onboardingDisabled: propsOnboardingDisabled } = props

  const { data } = useSWR<Dashboard>(API_DASHBOARD, fetcher)

  const dashboard = data ?? propsDashboard

  const [onboardingDisabled, setOnboardingDisabled] = useState(propsOnboardingDisabled)

  const selfLink: BreadcrumbLink = {
    name: t('common:dashboard'),
    url: ROUTE_DASHBOARD,
  }

  const handleApiError = defaultApiErrorHandler(t)

  const onToggleOnboarding = async () => {
    const res = await fetch(API_USERS_ME_PREFERENCES_ONBOARDING, { method: onboardingDisabled ? 'PUT' : 'DELETE' })
    if (!res.ok) {
      handleApiError(res)
      return
    }

    setOnboardingDisabled(!onboardingDisabled)
  }

  const getStatisticIcon = (it: string) => {
    switch (it) {
      case 'auditLog':
        return 'audits'
      case 'failedDeployments':
        return 'failed-deployments'
      default:
        return it
    }
  }

  const getStatisticLabel = (it: string) => {
    switch (it) {
      case 'users':
        return 'common:users'
      case 'deployments':
        return 'common:deployments'
      default:
        return it
    }
  }

  const formatCount = (count: number) => Intl.NumberFormat(lang, { notation: 'compact' }).format(count)

  const statisticItem = (property: string, count: number) => (
    <DyoCard className="flex flex-col p-4 justify-items-center items-center mb-4 break-inside-avoid" key={property}>
      <Image
        src={`/dashboard/${getStatisticIcon(property)}.svg`}
        width={46}
        height={46}
        alt={t(getStatisticLabel(property))}
      />
      <DyoLabel className="text-lg font-semibold my-2" textColor="text-bright">
        {formatCount(count)}
      </DyoLabel>
      <DyoLabel className="text-sm" textColor="text-light-eased">
        {t(getStatisticLabel(property))}
      </DyoLabel>
    </DyoCard>
  )

  return (
    <Layout title={t('common:dashboard')}>
      <PageHeading pageLink={selfLink} />
      <div className="flex flex-col">
        {/* Statistics */}
        <div className="flex flex-col">
          <DyoLabel className="mb-2 text-lg" textColor="text-light">
            {t('statistics')}
          </DyoLabel>

          <div className="columns-1 md:columns-2 lg:columns-3 2xl:columns-6 gap-4">
            {Object.keys(dashboard)
              .filter(it => typeof dashboard[it] === 'number')
              .map(it => statisticItem(it, dashboard[it]))}
          </div>
        </div>

        <div className="flex flex-col">
          {onboardingDisabled ? (
            <DyoIcon className="justify-self-end" src="/help.svg" alt={t('common:help')} onClick={onToggleOnboarding} />
          ) : (
            <>
              <DyoLabel className="mb-2 mt-4 text-lg" textColor="text-light">
                {t('onboarding')}
              </DyoLabel>

              <Onboarding onboarding={dashboard.onboarding} onClose={onToggleOnboarding} />

              <div className="bg-dyo-turquoise text-dyo-turquoise text-right rounded-md bg-opacity-10 p-4 ml-auto mt-4">
                {t('youCanHideOnboard')}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default DashboardPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const dashboard = await getCruxFromContext<Dashboard>(context, API_DASHBOARD)
  const session = await obtainSessionFromRequest(context.req)
  const onboardingDisabled = identityOnboardingDisabled(session)

  return {
    props: {
      dashboard,
      onboardingDisabled,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
