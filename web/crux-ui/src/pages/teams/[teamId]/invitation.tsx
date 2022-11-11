import { SingleFormLayout } from '@app/components/layout'
import AnchorAction from '@app/elements/dyo-anchor-action'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoLabel } from '@app/elements/dyo-label'
import { defaultApiErrorHandler } from '@app/errors'
import useAnchorActions from '@app/hooks/use-anchor-actions'
import { UserMetaTeam } from '@app/models'
import { ROUTE_404, ROUTE_INDEX, teamInvitationApiUrl } from '@app/routes'
import { redirectTo, withContextAuthorization } from '@app/utils'
import { cruxFromContext } from '@server/crux/crux'
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

  const sendInvitationRequest = async (method: 'PUT' | 'DELETE') => {
    const res = await fetch(teamInvitationApiUrl(team.id), {
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

  const acceptInvitation = () => sendInvitationRequest('PUT')
  const declineInvitation = () => sendInvitationRequest('DELETE')

  const anchors = useAnchorActions({
    acceptInvitation,
    declineInvitation,
  })

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
              <AnchorAction className="mx-auto  mt-16" href="acceptInvitation" anchors={anchors}>
                <DyoButton>{t('accept')}</DyoButton>
              </AnchorAction>

              <AnchorAction className="mx-auto  mt-16" href="declineInvitation" anchors={anchors}>
                <DyoButton className="px-4" color="bg-error-red">
                  {t('decline')}
                </DyoButton>
              </AnchorAction>
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

  const meta = await cruxFromContext(context).teams.getUserMeta()
  const team = meta.invitations.find(it => it.id === teamId) ?? null
  if (!team) {
    return redirectTo(ROUTE_404)
  }

  return {
    props: {
      team,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
