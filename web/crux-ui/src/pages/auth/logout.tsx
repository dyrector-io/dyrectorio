import { redirectTo, withContextAuthorization } from '@app/utils'
import kratos from '@server/kratos'
import { NextPageContext } from 'next'

const LogoutPage = () => {
  return <></>
}

export default LogoutPage

export const getPageServerSideProps = async (context: NextPageContext) => {
  const cookie = context.req.headers.cookie

  const kratosRes = await kratos.createSelfServiceLogoutFlowUrlForBrowsers(cookie)

  return redirectTo(kratosRes.data.logout_url)
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
