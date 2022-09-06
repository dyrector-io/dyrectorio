import { redirectTo, withContextAuthorization } from '@app/utils'
import kratos from '@server/kratos'
import { NextPageContext } from 'next'

// eslint-disable-next-line react/jsx-no-useless-fragment
const LogoutPage = () => <></>

export default LogoutPage

export const getPageServerSideProps = async (context: NextPageContext) => {
  const { cookie } = context.req.headers

  const kratosRes = await kratos.createSelfServiceLogoutFlowUrlForBrowsers(cookie)

  return redirectTo(kratosRes.data.logout_url)
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
