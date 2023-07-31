import { UserMeta } from '@app/models'
import { API_USERS_ME, ROUTE_INDEX, TeamRoutes } from '@app/routes'
import { redirectTo, withContextAuthorization } from '@app/utils'
import { postCruxFromContext } from '@server/crux-api'
import { NextPageContext } from 'next'

// eslint-disable-next-line react/jsx-no-useless-fragment
const TeamSlugPage = () => <></>

export default TeamSlugPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const teamSlug = context.query.teamSlug as string

  const meta = await postCruxFromContext<UserMeta>(context, API_USERS_ME)
  if (!meta?.teams?.find(it => it.slug === teamSlug)) {
    return redirectTo(ROUTE_INDEX)
  }

  const routes = TeamRoutes.fromContext(context)
  return redirectTo(routes.dashboard.index())
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
