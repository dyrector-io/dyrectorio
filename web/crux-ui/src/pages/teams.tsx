import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { ListPageMenu } from '@app/components/shared/page-menu'
import EditTeamCard from '@app/components/team/edit-team-card'
import TeamCard from '@app/components/team/team-card'
import { COOKIE_TEAM_SLUG } from '@app/const'
import useSubmit from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { Team } from '@app/models'
import { appendTeamSlug } from '@app/providers/team-routes'
import { API_TEAMS, API_USERS_ME, ROUTE_INDEX, ROUTE_TEAMS } from '@app/routes'
import { redirectTo, withContextAuthorization } from '@app/utils'
import { getCookie } from '@server/cookie'
import { getCruxFromContext } from '@server/crux-api'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'
import { useSWRConfig } from 'swr'

interface TeamsPageProps {
  teams: Team[]
}

const TeamsPage = (props: TeamsPageProps) => {
  const { teams: propsTeams } = props

  const { t } = useTranslation('teams')

  const routes = useTeamRoutes()
  const { mutate } = useSWRConfig()

  const [teams, setTeams] = useState(propsTeams)
  const [creating, setCreating] = useState(false)

  const submit = useSubmit()

  const onCreated = (team: Team) => {
    setCreating(false)
    setTeams([...teams, team])
    mutate(API_USERS_ME)
  }

  const selfLink: BreadcrumbLink = {
    name: t('common:teams'),
    url: ROUTE_TEAMS,
  }

  return (
    <Layout title={t('common:teams')}>
      <PageHeading pageLink={selfLink}>
        <ListPageMenu creating={creating} setCreating={setCreating} submit={submit} />
      </PageHeading>

      {!creating ? null : <EditTeamCard className="mb-8 px-8 py-6" submit={submit} onTeamEdited={onCreated} />}

      {teams.map((team, index) => (
        <TeamCard key={`team-${index}`} className="my-2" team={team} highlighted={team.slug === routes?.teamSlug} />
      ))}
    </Layout>
  )
}

export default TeamsPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const teams = await getCruxFromContext<Team[]>(context, API_TEAMS)

  if (teams.length < 1) {
    return redirectTo(ROUTE_INDEX)
  }

  const teamSlug = getCookie(context, COOKIE_TEAM_SLUG) ?? teams[0].slug

  return {
    props: appendTeamSlug(teamSlug, {
      teams,
    }),
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
