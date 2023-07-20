import { TeamRoutes } from '@app/routes'
import { redirectTo, withContextAuthorization } from '@app/utils'
import { NextPageContext } from 'next'

// eslint-disable-next-line react/jsx-no-useless-fragment
const TeamSlugPage = () => <></>

export default TeamSlugPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const routes = TeamRoutes.fromContext(context)
  return redirectTo(routes.dashboard.index())
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
