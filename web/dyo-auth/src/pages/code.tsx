import { NextPageContext } from 'next'
import { ROUTE_LOGIN } from '../const'
import core from '../server/core'
import kratos from '../server/kratos'
import { obtainSession, redirectTo } from '../utils'

const CodePage = () => {
  return <></>
}

export default CodePage

export async function getServerSideProps(context: NextPageContext) {
  const session = await obtainSession(context, kratos)

  return redirectTo(
    session
      ? core.codeExchangeUrl(context.query['code'] as string)
      : ROUTE_LOGIN,
  )
}
