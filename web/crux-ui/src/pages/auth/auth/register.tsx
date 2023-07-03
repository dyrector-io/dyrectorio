import { ROUTE_REGISTER } from '@app/routes'
import { redirectTo } from '@app/utils'
import { NextPageContext } from 'next'

// eslint-disable-next-line react/jsx-no-useless-fragment
const RegistrationPage = () => <></>

export default RegistrationPage

// There is a bug with kratos, where it redirects to the /auth/auth/register page
// when the user does not grant the necessary permission, or missing the e-mail for an oidc flow
// TODO(@m8vago): remove this redirection, when kratos gets fixed
export const getServerSideProps = async (context: NextPageContext) =>
  redirectTo(context.req.url.replace('/auth/auth/register', ROUTE_REGISTER))
