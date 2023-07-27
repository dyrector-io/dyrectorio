import { TeamRoutes } from '@app/routes'
import { useRouter } from 'next/router'
import React, { useRef } from 'react'

const TEAM_SLUG_PROP = 'selectedTeamSlug'

type TeamRoutesContextProps = {
  routes: TeamRoutes
}

export const TeamRoutesContext = React.createContext<TeamRoutesContextProps>({ routes: null })

type TeamRoutesProviderValue = {
  pageProps: any
}

export const TeamRoutesProvider = (props: React.PropsWithChildren<TeamRoutesProviderValue>) => {
  const { pageProps, children } = props

  const router = useRouter()
  const routesRef = useRef<TeamRoutes>()

  const teamSlug: string = (router.query.teamSlug as string) ?? pageProps[TEAM_SLUG_PROP]

  if (routesRef.current?.teamSlug !== teamSlug) {
    routesRef.current = teamSlug ? new TeamRoutes(teamSlug) : null
  }

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  return <TeamRoutesContext.Provider value={{ routes: routesRef.current }}>{children}</TeamRoutesContext.Provider>
}

export const appendTeamSlug = (teamSlug: string, props: any): any => {
  props[TEAM_SLUG_PROP] = teamSlug
  return props
}
