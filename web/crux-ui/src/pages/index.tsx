import { COOKIE_TEAM_SLUG } from '@app/const'
import { UserMeta } from '@app/models'
import { API_USERS_ME, ROUTE_TEAMS_CREATE, selectTeamUrl, teamInvitationUrl } from '@app/routes'
import { redirectTo, withContextAuthorization } from '@app/utils'
import { getCookie } from '@server/cookie'
import { postCruxFromContext } from '@server/crux-api'
import { NextPageContext } from 'next'

// eslint-disable-next-line react/jsx-no-useless-fragment
const IndexPage = () => <></>

export default IndexPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const user = await postCruxFromContext<UserMeta>(context, API_USERS_ME)
  if (user.teams.length < 1) {
    const inv = user.invitations.length > 0 ? user.invitations[0] : null

    return redirectTo(inv ? teamInvitationUrl(inv.id) : ROUTE_TEAMS_CREATE)
  }

  let teamSlug = getCookie(context, COOKIE_TEAM_SLUG)
  if (!user.teams.find(it => it.slug === teamSlug)) {
    const firstTeam = user.teams[0]
    teamSlug = firstTeam.slug
  }

  return redirectTo(selectTeamUrl(teamSlug))
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
