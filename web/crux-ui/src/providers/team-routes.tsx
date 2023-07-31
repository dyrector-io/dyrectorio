import { TeamRoutes } from '@app/routes'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'

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

  const teamSlug: string = (router.query.teamSlug as string) ?? pageProps[TEAM_SLUG_PROP]

  const contextValue = useMemo<TeamRoutesContextProps>(
    () => ({
      routes: teamSlug ? new TeamRoutes(teamSlug) : null,
    }),
    [teamSlug],
  )

  return <TeamRoutesContext.Provider value={contextValue}>{children}</TeamRoutesContext.Provider>
}

export const appendTeamSlug = (teamSlug: string, props: any): any => {
  props[TEAM_SLUG_PROP] = teamSlug
  return props
}
