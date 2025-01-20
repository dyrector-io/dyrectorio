import Onboarding from '@app/components/dashboard/onboarding'
import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { COOKIE_TEAM_SLUG } from '@app/const'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoLink from '@app/elements/dyo-link'
import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import { defaultApiErrorHandler } from '@app/errors'
import useConfirmation from '@app/hooks/use-confirmation'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { Dashboard, UserMeta } from '@app/models'
import { API_USERS_ME, API_USERS_ME_PREFERENCES_ONBOARDING, TeamRoutes, teamUrl } from '@app/routes'
import { fetcher, withContextAuthorization } from '@app/utils'
import { getCookie } from '@server/cookie'
import { getCruxFromContext, postCruxFromContext } from '@server/crux-api'
import { identityOnboardingDisabled, obtainSessionFromRequest } from '@server/kratos'
import { GetServerSidePropsContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { QA_DIALOG_LABEL_HIDE_ONBOARDING } from 'quality-assurance'
import { useState } from 'react'
import useSWR from 'swr'

type DashboardPageProps = {
  dashboard: Dashboard
  onboardingDisabled: boolean
  teamId: string
}

const DashboardPage = (props: DashboardPageProps) => {
  const { dashboard: propsDashboard, onboardingDisabled: propsOnboardingDisabled, teamId } = props

  const { t, lang } = useTranslation('dashboard')
  const routes = useTeamRoutes()

  const handleApiError = defaultApiErrorHandler(t)

  const { data } = useSWR<Dashboard>(routes.dashboard.api(), fetcher)

  const dashboard = data ?? propsDashboard

  const [onboardingDisabled, setOnboardingDisabled] = useState(propsOnboardingDisabled)

  const [confirmHideOnboardingConfig, confirmHideOnboarding] = useConfirmation()

  const hideOnboarding = async () => {
    const confirmed = await confirmHideOnboarding({
      qaLabel: QA_DIALOG_LABEL_HIDE_ONBOARDING,
      title: t('common:areYouSure'),
      description: t('areYouSureHideOnboarding'),
      confirmText: t('hide'),
      cancelColor: 'bg-warning-orange',
    })
    if (!confirmed) {
      return
    }

    const res = await fetch(API_USERS_ME_PREFERENCES_ONBOARDING, { method: onboardingDisabled ? 'PUT' : 'DELETE' })
    if (!res.ok) {
      await handleApiError(res)
      return
    }

    setOnboardingDisabled(!onboardingDisabled)
  }

  const selfLink: BreadcrumbLink = {
    name: t('common:dashboard'),
    url: routes.dashboard.index(),
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

  const getStatisticRedirect = (it: string) => {
    switch (it) {
      case 'projects':
      case 'versions':
        return routes.project.list()
      case 'auditLog':
        return routes.audit.list()
      case 'deployments':
      case 'failedDeployments':
        return routes.deployment.list()
      case 'users':
        return teamUrl(teamId)
      default:
        return '#'
    }
  }

  const formatCount = (count: number) => Intl.NumberFormat(lang, { notation: 'compact' }).format(count)

  const statisticItem = (property: string, count: number) => (
    <DyoLink key={property} href={getStatisticRedirect(property)} qaLabel={`dashboard-statistic-item-${property}`}>
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
    </DyoLink>
  )

  return (
    <Layout title={t('common:dashboard')}>
      <PageHeading pageLink={selfLink} />

      <div className="flex flex-col">
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
          {onboardingDisabled ? null : (
            <>
              <DyoLabel className="mb-2 mt-4 text-lg" textColor="text-light">
                {t('onboarding')}
              </DyoLabel>

              <Onboarding onboarding={dashboard.onboarding} onClose={hideOnboarding} />

              <div className="bg-dyo-turquoise text-dyo-turquoise text-right rounded-md bg-opacity-10 p-4 ml-auto mt-4">
                {t('whenReadyToHideOnboard')}
              </div>
            </>
          )}
        </div>
      </div>

      <DyoConfirmationModal config={confirmHideOnboardingConfig} className="w-1/4" />
    </Layout>
  )
}

export default DashboardPage

const getPageServerSideProps = async (context: GetServerSidePropsContext) => {
  const dashboard = await getCruxFromContext<Dashboard>(context, TeamRoutes.fromContext(context).dashboard.api())

  const session = await obtainSessionFromRequest(context.req)
  const onboardingDisabled = identityOnboardingDisabled(session)

  const user = await postCruxFromContext<UserMeta>(context, API_USERS_ME)
  const teamSlug = getCookie(context, COOKIE_TEAM_SLUG)
  const teamId = user.teams.find(it => it.slug === teamSlug)?.id

  return {
    props: {
      dashboard,
      onboardingDisabled,
      teamId,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
