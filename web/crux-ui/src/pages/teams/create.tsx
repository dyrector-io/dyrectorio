import { SingleFormLayout } from '@app/components/layout'
import CreateTeamCard from '@app/components/team/create-team-card'
import { Team, UserMeta } from '@app/models'
import { API_USERS_ME, ROUTE_INDEX, ROUTE_LOGOUT } from '@app/routes'
import { redirectTo, withContextAuthorization } from '@app/utils'
import { postCruxFromContext, teamCreationDisabled } from '@server/crux-api'
import { GetServerSidePropsContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import Link from 'next/link'
import { useRouter } from 'next/router'

type CreateTeamPageProps = {
  disabled: boolean
}

const CreateTeamPage = (props: CreateTeamPageProps) => {
  const { disabled } = props

  const { t } = useTranslation('teams')

  const router = useRouter()

  const onTeamCreated = (_: Team) => router.replace(ROUTE_INDEX)

  return (
    <SingleFormLayout title={t('createTeam')}>
      {!disabled ? (
        <CreateTeamCard className="p-8 m-auto" onTeamCreated={onTeamCreated} />
      ) : (
        <div className="flex flex-col gap-4 items-center text-bright">
          <span>{t('creationDisabled')}</span>
          <Link className="font-bold underline" href={ROUTE_LOGOUT}>
            {t('common:logOut')}
          </Link>
        </div>
      )}
    </SingleFormLayout>
  )
}

export default CreateTeamPage

const getPageServerSideProps = async (context: GetServerSidePropsContext) => {
  const user = await postCruxFromContext<UserMeta>(context, API_USERS_ME)

  if (user.teams.length > 0) {
    return redirectTo(ROUTE_INDEX)
  }

  return {
    props: {
      disabled: teamCreationDisabled(),
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
