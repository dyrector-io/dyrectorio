import { ROUTE_LOGIN } from '@app/const'
import { obtainSessionWithCookie, redirectTo } from '@app/utils'
import kratos from '@server/kratos'
import { NextPageContext } from 'next'

const LogoutPage = () => {
  return <div></div>
}

export default LogoutPage

export async function getServerSideProps(context: NextPageContext) {
  const [_, cookie] = await obtainSessionWithCookie(context, kratos)

  if (!cookie) {
    return redirectTo(ROUTE_LOGIN)
  }

  const kratosRes = await kratos.createSelfServiceLogoutFlowUrlForBrowsers(
    cookie,
  )

  return redirectTo(kratosRes.data.logout_url)
}
