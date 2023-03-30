import { SingleFormLayout } from '@app/components/layout'
import CreateTeamCard from '@app/components/team/create-team-card'
import { activeTeamOf, Team, UserMeta } from '@app/models'
import { API_USERS_ME, ROUTE_INDEX } from '@app/routes'
import { redirectTo, withContextAuthorization } from '@app/utils'
import { postCruxFromContext } from '@server/crux-api'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'

const CreateTeamPage = () => {
  const { t } = useTranslation('teams')

  const router = useRouter()

  const onTeamCreated = (_: Team) => router.replace(ROUTE_INDEX)

  return (
    <SingleFormLayout title={t('createTeam')}>
      <CreateTeamCard className="p-8 m-auto" onTeamCreated={onTeamCreated} />
    </SingleFormLayout>
  )
}

export default CreateTeamPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const user = await postCruxFromContext<UserMeta>(context, API_USERS_ME)
  const activeTeam = activeTeamOf(user)

  if (activeTeam) {
    return redirectTo(ROUTE_INDEX)
  }

  return {
    props: {},
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
