import { STORAGE_TEAM_SLUG } from '@app/const'
import useLocalStorage from '@app/hooks/use-local-storage'
import { TeamRoutes } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { NextPageContext } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

type TeamSlugPageProps = {
  teamSlug: string
}

const TeamSlugPage = (props: TeamSlugPageProps) => {
  const { teamSlug: propsTeamSlug } = props

  const router = useRouter()
  const [teamSlug] = useLocalStorage(STORAGE_TEAM_SLUG, propsTeamSlug, {
    overwrite: true,
  })

  useEffect(() => {
    if (teamSlug) {
      const routes = new TeamRoutes(teamSlug)
      router.replace(routes.dashboard.index())
    }
  }, [teamSlug, router])

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <></>
}

export default TeamSlugPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const teamSlug = context.query.teamSlug as string

  return {
    props: {
      teamSlug,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
