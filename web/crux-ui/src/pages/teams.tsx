import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { ListPageMenu } from '@app/components/shared/page-menu'
import EditTeamCard from '@app/components/team/edit-team-card'
import TeamCard from '@app/components/team/team-card'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { Team } from '@app/models'
import { API_TEAMS, ROUTE_TEAMS } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRef, useState } from 'react'

interface TeamsPageProps {
  teams: Team[]
}

const TeamsPage = (props: TeamsPageProps) => {
  const { teams: propsTeams } = props

  const { t } = useTranslation('teams')
  const routes = useTeamRoutes()

  const [teams, setTeams] = useState(propsTeams)
  const [creating, setCreating] = useState(false)

  const submitRef = useRef<() => Promise<any>>()

  const onCreated = (team: Team) => {
    setCreating(false)
    setTeams([...teams, team])
  }

  const selfLink: BreadcrumbLink = {
    name: t('common:teams'),
    url: ROUTE_TEAMS,
  }

  return (
    <Layout title={t('common:teams')}>
      <PageHeading pageLink={selfLink}>
        <ListPageMenu creating={creating} setCreating={setCreating} submitRef={submitRef} />
      </PageHeading>

      {!creating ? null : <EditTeamCard className="mb-8 px-8 py-6" submitRef={submitRef} onTeamEdited={onCreated} />}

      {teams.map((team, index) => (
        <TeamCard key={`team-${index}`} className="my-2" team={team} highlighted={team.slug === routes?.teamSlug} />
      ))}
    </Layout>
  )
}

export default TeamsPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const teams = await getCruxFromContext<Team[]>(context, API_TEAMS)

  return {
    props: {
      teams,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
