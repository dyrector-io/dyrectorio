import { STORAGE_TEAM_SLUG } from '@app/const'
import useLocalStorage from '@app/hooks/use-local-storage'
import { UserMeta, UserMetaTeam } from '@app/models'
import { API_USERS_ME, ROUTE_TEAMS_CREATE, teamInvitationUrl, TeamRoutes } from '@app/routes'
import { redirectTo, withContextAuthorization } from '@app/utils'
import { postCruxFromContext } from '@server/crux-api'
import { NextPageContext } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

type IndexPageProps = {
  team: UserMetaTeam
}

const IndexPage = (props: IndexPageProps) => {
  const { team } = props

  const router = useRouter()
  const [teamSlug] = useLocalStorage(STORAGE_TEAM_SLUG, team.slug)

  useEffect(() => {
    if (teamSlug) {
      const routes = new TeamRoutes(teamSlug)

      router.replace(routes.dashboard.index())
    }
  }, [teamSlug, router])

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <></>
}

export default IndexPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const user = await postCruxFromContext<UserMeta>(context, API_USERS_ME)
  if (user.teams.length < 1) {
    const inv = user.invitations.length > 0 ? user.invitations[0] : null

    return redirectTo(inv ? teamInvitationUrl(inv.id) : ROUTE_TEAMS_CREATE)
  }

  return {
    props: {
      team: user.teams[0],
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
