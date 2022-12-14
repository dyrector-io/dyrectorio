import { ROUTE_LOGIN } from '@app/routes'
import { redirectTo } from '@app/utils'
import kratos, { obtainKratosSession } from '@server/kratos'
import { NextPageContext } from 'next'

// eslint-disable-next-line react/jsx-no-useless-fragment
const LogoutPage = () => <></>

export default LogoutPage

export const getPageServerSideProps = async (context: NextPageContext) => {
  const { cookie } = context.req.headers

  const session = await obtainKratosSession(context.req)
  if (!session) {
    return redirectTo(ROUTE_LOGIN)
  }

  const kratosRes = await kratos.createBrowserLogoutFlow({
    cookie,
  })

  return redirectTo(kratosRes.data.logout_url)
}

export const getServerSideProps = getPageServerSideProps
