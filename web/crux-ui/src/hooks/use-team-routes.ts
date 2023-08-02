import { TeamRoutesContext } from '@app/providers/team-routes'
import { TeamRoutes } from '@app/routes'
import { useContext } from 'react'

const useTeamRoutes = (): TeamRoutes => {
  const context = useContext(TeamRoutesContext)
  return context.routes
}

export default useTeamRoutes
