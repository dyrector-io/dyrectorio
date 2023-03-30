import { SingleFormLayout } from '@app/components/layout'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoLabel } from '@app/elements/dyo-label'
import { defaultApiErrorHandler } from '@app/errors'
import { UserMeta, UserMetaTeam } from '@app/models'
import { API_USERS_ME, ROUTE_404, ROUTE_INDEX, ROUTE_LOGIN, userInvitationApiUrl } from '@app/routes'
import { redirectTo, setupContextSession, withContextErrorHandling } from '@app/utils'
import { postCruxFromContext } from '@server/crux-api'
import { obtainSessionFromRequest } from '@server/kratos'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useState } from 'react'

interface AcceptInvitationPageProps {
  team: UserMetaTeam
}

const AcceptInvitationPage = (props: AcceptInvitationPageProps) => {
  const { t } = useTranslation('teams')

  const router = useRouter()

  const { team } = props

  const [expired, setExpired] = useState(false)

  const onContinue = () => router.replace(ROUTE_INDEX)

  const handleApiError = defaultApiErrorHandler(t)

  const sendInvitationRequest = async (method: 'POST' | 'DELETE') => {
    const res = await fetch(userInvitationApiUrl(team.id), {
      method,
    })

    if (res.ok) {
      router.replace(ROUTE_INDEX)
    } else if (res.status === 412) {
      setExpired(true)
    } else {
      handleApiError(res)
    }
  }

  const onAcceptInvitation = () => sendInvitationRequest('POST')
  const onDeclineInvitation = () => sendInvitationRequest('DELETE')

  return (
    <SingleFormLayout title={t('teamsNameInvite', team)}>
      <DyoCard className="flex flex-col p-8 m-auto">
        <Image
          className=" mx-auto mb-8"
          src="/dyrector_io_logo_white.svg"
          alt={t('common:dyoWhiteLogo')}
          width={200}
          height={80}
        />

        {!expired ? (
          <>
            <DyoLabel className="mt-4">{t('youHaveBeenInvited', { name: team.name })}</DyoLabel>

            <div className="flex flex-row">
              <DyoButton className="mx-auto  mt-16 px-4" onClick={onAcceptInvitation}>
                {t('accept')}
              </DyoButton>

              <DyoButton className="mx-auto  mt-16 px-4" onClick={onDeclineInvitation} color="bg-error-red">
                {t('decline')}
              </DyoButton>
            </div>
          </>
        ) : (
          <>
            <DyoLabel className="mx-auto">{t('expired', { name: team.name })}</DyoLabel>

            <DyoButton className="mx-auto px-4 mt-12" onClick={onContinue}>
              {t('common:continue')}
            </DyoButton>
          </>
        )}
      </DyoCard>
    </SingleFormLayout>
  )
}

export default AcceptInvitationPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const teamId = context.query.teamId as string
  const session = await obtainSessionFromRequest(context.req)
  if (!session) {
    return redirectTo(`${ROUTE_LOGIN}?invitation=${teamId}`)
  }

  await setupContextSession(context, session)

  const user = await postCruxFromContext<UserMeta>(context, API_USERS_ME)
  const team = user.invitations.find(it => it.id === teamId) ?? null
  if (!team) {
    return redirectTo(ROUTE_404)
  }

  return {
    props: {
      team,
    },
  }
}

export const getServerSideProps = withContextErrorHandling(getPageServerSideProps)
