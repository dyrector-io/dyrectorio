import { SingleFormLayout } from '@app/components/layout'
import { DyoButton } from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoLabel } from '@app/elements/dyo-label'
import { defaultApiErrorHandler, defaultTranslator } from '@app/errors'
import { UserMetaTeam } from '@app/models'
import { ROUTE_INDEX, teamAcceptInviteApiUrl } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { cruxFromContext } from '@server/crux/crux'
import { DyoApiError, isDyoApiError, notFoundError } from '@server/error-middleware'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React from 'react'

interface AcceptInvitationPageProps {
  accepted: boolean
  error: DyoApiError
  team: UserMetaTeam
}

const AcceptInvitationPage = (props: AcceptInvitationPageProps) => {
  const { t } = useTranslation('teams')

  const router = useRouter()

  const { accepted, error: apiError, team } = props

  const onContinue = () => router.replace(ROUTE_INDEX)

  const errorTranslator = defaultTranslator(t)
  const handleApiError = defaultApiErrorHandler(t)

  const onAccept = async () => {
    const res = await fetch(teamAcceptInviteApiUrl(team.id), {
      method: 'POST',
    })

    if (res.ok) {
      onContinue()
    } else {
      handleApiError(res)
    }
  }

  const errorMessage = apiError ? errorTranslator(apiError.error, apiError.status, apiError)?.toast : null
  return (
    <SingleFormLayout>
      <DyoCard className="p-8 m-auto">
        {errorMessage ? (
          <DyoLabel>{errorMessage}</DyoLabel>
        ) : (
          <div className="flex flex-col">
            <Image
              className=" mx-auto mb-8"
              src="/dyrector_io_logo_white.svg"
              alt={t('common:dyoWhiteLogo')}
              width={200}
              height={80}
            />

            {accepted ? (
              <>
                <DyoLabel>{t('acceptSuccess', { name: team.name })}</DyoLabel>

                <DyoButton className="mx-auto px-4 mt-16" onClick={onContinue}>
                  {t('common:continue')}
                </DyoButton>
              </>
            ) : (
              <>
                <DyoLabel>{t('youHaveBeenInvited', { name: team.name })}</DyoLabel>

                <DyoButton className="mx-auto px-4 mt-16" onClick={onAccept}>
                  {t('accept')}
                </DyoButton>
              </>
            )}
          </div>
        )}
      </DyoCard>
    </SingleFormLayout>
  )
}

export default AcceptInvitationPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const teamId = context.query.teamId as string
  const accept = context.query.accept

  let error: DyoApiError = null
  let team: UserMetaTeam = null
  let accepted = false

  try {
    const meta = await cruxFromContext(context).teams.getUserMeta()
    team = meta.invitations.find(it => it.id === teamId) ?? null
    if (!team) {
      throw notFoundError('teamId', 'Team not found', teamId)
    }

    if (accept) {
      await cruxFromContext(context).teams.acceptInvitation(teamId)
      accepted = true
    }
  } catch (err) {
    if (!isDyoApiError(err)) {
      throw err
    }

    error = err
  }

  return {
    props: {
      accepted,
      error,
      team,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
