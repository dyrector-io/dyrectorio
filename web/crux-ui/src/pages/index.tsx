import { UserMeta } from '@app/models'
import { API_USERS_ME, ROUTE_DASHBOARD, ROUTE_TEAMS_CREATE, teamInvitationUrl } from '@app/routes'
import { redirectTo, withContextAuthorization } from '@app/utils'
import { postCruxFromContext } from '@server/crux-api'
import { NextPageContext } from 'next'

// eslint-disable-next-line react/jsx-no-useless-fragment
const Index = () => <></>

export default Index

const getPageServerSideProps = async (context: NextPageContext) => {
  const user = await postCruxFromContext<UserMeta>(context, API_USERS_ME)
  if (!user.activeTeamId) {
    const inv = user.invitations.length > 0 ? user.invitations[0] : null

    return redirectTo(inv ? teamInvitationUrl(inv.id) : ROUTE_TEAMS_CREATE)
  }

  return redirectTo(ROUTE_DASHBOARD)
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
