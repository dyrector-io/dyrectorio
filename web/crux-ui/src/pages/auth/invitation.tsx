import { SingleFormLayout } from '@app/components/layout'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoLabel } from '@app/elements/dyo-label'
import { ROUTE_INDEX } from '@app/routes'
import { redirectTo } from '@app/utils'
import { assambleKratosRecoveryUrl } from '@server/kratos'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'

interface AcceptInvitationPageProps {
  kratosInviteUrl: string
}

const AcceptInvitationPage = (props: AcceptInvitationPageProps) => {
  const { t } = useTranslation('invitation')

  const { kratosInviteUrl } = props

  return (
    <SingleFormLayout title={t('invitation')}>
      <DyoCard className="flex flex-col p-8 m-auto">
        <Image
          className=" mx-auto mb-8"
          src="/dyrector_io_logo_white.svg"
          alt={t('common:dyoWhiteLogo')}
          width={200}
          height={80}
        />

        <DyoLabel className="mt-4">{t('invitedToDyrectorio')}</DyoLabel>

        <DyoButton className="mx-auto px-4 mt-12" href={kratosInviteUrl}>
          {t('createAccount')}
        </DyoButton>
      </DyoCard>
    </SingleFormLayout>
  )
}

export default AcceptInvitationPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const flow = context.query.flow as string
  const token = context.query.token as string

  if (!flow || !token) {
    return redirectTo(ROUTE_INDEX)
  }

  const kratosInviteUrl = assambleKratosRecoveryUrl(flow, token)
  return {
    props: {
      kratosInviteUrl,
    },
  }
}

export const getServerSideProps = getPageServerSideProps
