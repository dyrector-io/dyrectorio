import { NextPageContext } from 'next'
import React from 'react'
import { ROUTE_LOGIN } from '@app/const'
import kratos from '@server/kratos'
import { obtainSession, redirectTo } from '@app/utils'

const Index = () => {
  return <></>
}

export default Index

export async function getServerSideProps(context: NextPageContext) {
  const session = await obtainSession(context, kratos)

  return redirectTo(session ? process.env.CRUX_UI_URL : ROUTE_LOGIN)
}
