import { SingleFormLayout } from '@app/components/layout'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import { ROUTE_LOGIN, ROUTE_SETTINGS } from '@app/routes'
import { redirectTo } from '@app/utils'
import { assambleKratosRecoveryUrl, obtainKratosSession } from '@server/kratos'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'

interface InviteProps {
  url?: string
}

const InvitePage = (props: InviteProps) => {
  const { url } = props

  const { t } = useTranslation('invite')

  if (!url) {
    return (
      <SingleFormLayout title={t('expired')}>
        <DyoCard className="my-16 mx-auto flex flex-col items-center">
          <DyoHeading>{t('expired')}</DyoHeading>
          <DyoLabel>{t('pleaseContact')}</DyoLabel>
        </DyoCard>
      </SingleFormLayout>
    )
  }

  const onAccept = () => window.location.assign(url)

  return (
    <SingleFormLayout title={t('welcome')}>
      <DyoCard className="flex flex-col items-center p-8 m-auto">
        <DyoHeading>{t('welcome')}</DyoHeading>

        <DyoLabel>{t('youAreInvited')}</DyoLabel>

        <p className="my-8 text-bright">{t('pleaseAccept')}</p>

        <DyoButton className="px-8" onClick={onAccept}>
          {t('accept')}
        </DyoButton>
      </DyoCard>
    </SingleFormLayout>
  )
}

export default InvitePage

export const getPageServerSideProps = async (context: NextPageContext) => {
  const session = await obtainKratosSession(context.req)

  if (session) {
    return redirectTo(ROUTE_SETTINGS)
  }

  const flow = context.query.flow as string
  const token = context.query.token as string
  const { expired } = context.query

  if (expired) {
    return {
      props: {},
    }
  }

  if (!flow || !token) {
    return redirectTo(ROUTE_LOGIN)
  }

  return {
    props: {
      url: assambleKratosRecoveryUrl(flow, token),
    },
  }
}

export const getServerSideProps = getPageServerSideProps
