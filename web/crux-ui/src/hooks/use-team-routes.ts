import { STORAGE_TEAM_SLUG } from '@app/const'
import { TeamRoutes } from '@app/routes'
import { useRouter } from 'next/router'
import { useRef } from 'react'
import useLocalStorage from './use-local-storage'

const useTeamRoutes = (): TeamRoutes => {
  const router = useRouter()
  const slug = router.query.teamSlug as string

  const [teamSlug] = useLocalStorage<string>(STORAGE_TEAM_SLUG, slug, {
    overwrite: !!slug,
  })

  const routes = useRef<TeamRoutes>(null)
  if (!routes.current && teamSlug) {
    routes.current = new TeamRoutes(teamSlug)
  }

  return routes.current
}

export default useTeamRoutes
