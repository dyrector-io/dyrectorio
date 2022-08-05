import { SingleFormLayout } from '@app/components/layout'
import CreateTeamCard from '@app/components/team/create-team-card'
import { Team } from '@app/models'
import { ROUTE_INDEX } from '@app/routes'
import { redirectTo, withContextAuthorization } from '@app/utils'
import { cruxFromContext } from '@server/crux/crux'
import { NextPageContext } from 'next'
import { useRouter } from 'next/router'

const CreateTeamPage = () => {
  const router = useRouter()

  const onTeamCreated = (_: Team) => router.replace(ROUTE_INDEX)

  return (
    <SingleFormLayout>
      <CreateTeamCard className="p-8 m-auto" onTeamCreated={onTeamCreated} />
    </SingleFormLayout>
  )
}

export default CreateTeamPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const team = await cruxFromContext(context).teams.getActiveTeam()
  if (team) {
    return redirectTo(ROUTE_INDEX)
  }

  return {
    props: {},
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
