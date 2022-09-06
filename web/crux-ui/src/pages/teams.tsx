import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { ListPageMenu } from '@app/components/shared/page-menu'
import EditTeamCard from '@app/components/team/edit-team-card'
import TeamCard from '@app/components/team/team-card'
import { Team, UserMeta } from '@app/models'
import { ROUTE_INDEX, ROUTE_TEAMS } from '@app/routes'
import { redirectTo, withContextAuthorization } from '@app/utils'
import { cruxFromContext } from '@server/crux/crux'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRef, useState } from 'react'

interface TeamsPageProps {
  me: UserMeta
  teams: Team[]
}

const TeamsPage = (props: TeamsPageProps) => {
  const { me, teams: propsTeams } = props

  const { t } = useTranslation('teams')

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
        <TeamCard key={`team-${index}`} className="my-2" team={team} highlighted={team.id === me.activeTeamId} />
      ))}
    </Layout>
  )
}

export default TeamsPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const crux = cruxFromContext(context)

  const me = await crux.teams.getUserMeta()
  if (!me.activeTeamId) {
    return redirectTo(ROUTE_INDEX)
  }

  const teams = await crux.teams.getAllTeams()

  return {
    props: {
      me,
      teams,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
