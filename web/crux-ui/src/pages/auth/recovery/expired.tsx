import { SingleFormLayout } from '@app/components/layout'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { ROUTE_LOGIN, ROUTE_SETTINGS } from '@app/routes'
import { redirectTo } from '@app/utils'
import { obtainSessionFromRequest } from '@server/kratos'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'

const RecoveryExpiredPage = () => {
  const { t } = useTranslation('invite')

  return (
    <SingleFormLayout title={t('expired')}>
      <DyoCard className="my-16 mx-auto flex flex-col items-center">
        <DyoHeading>{t('expired')}</DyoHeading>

        <DyoButton href={ROUTE_LOGIN}>{t('backToLogin')}</DyoButton>
      </DyoCard>
    </SingleFormLayout>
  )
}

export default RecoveryExpiredPage

export const getPageServerSideProps = async (context: NextPageContext) => {
  const session = await obtainSessionFromRequest(context.req)

  if (session) {
    return redirectTo(ROUTE_SETTINGS)
  }

  return {
    props: {},
  }
}

export const getServerSideProps = getPageServerSideProps
