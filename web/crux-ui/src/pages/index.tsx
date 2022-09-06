import { ROUTE_PRODUCTS, ROUTE_TEAMS_CREATE, teamInviteUrl } from '@app/routes'
import { redirectTo, withContextAuthorization } from '@app/utils'
import { cruxFromContext } from '@server/crux/crux'
import { NextPageContext } from 'next'

// eslint-disable-next-line react/jsx-no-useless-fragment
const Index = () => <></>

export default Index

const getPageServerSideProps = async (context: NextPageContext) => {
  const meta = await cruxFromContext(context).teams.getUserMeta()
  if (!meta.activeTeamId) {
    const inv = meta.invitations.length > 0 ? meta.invitations[0] : null

    return redirectTo(inv ? teamInviteUrl(inv.id) : ROUTE_TEAMS_CREATE)
  }

  return redirectTo(ROUTE_PRODUCTS)
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
