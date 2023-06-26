import { SingleFormLayout } from '@app/components/layout'
import DyoButton from '@app/elements/dyo-button'
import { DyoHeading } from '@app/elements/dyo-heading'
import { ROUTE_DASHBOARD, ROUTE_STATUS } from '@app/routes'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'

const Page500 = () => {
  const { t } = useTranslation('status')
  const router = useRouter()

  const navigateToDashboard = async () => await router.push(ROUTE_DASHBOARD)

  return (
    <SingleFormLayout title={t('errors:internalError')}>
      <DyoHeading element="h2" className="self-center text-lg lg:text-2xl text-white font-extrabold mt-auto">
        {t('errors:internalError')}
      </DyoHeading>

      <div className="flex flex-row mb-auto mt-12">
        <DyoButton className="px-12" outlined onClick={navigateToDashboard}>
          {t('common:dashboard')}
        </DyoButton>

        <DyoButton className="ml-2 mr-auto px-12" href={ROUTE_STATUS}>
          {t('common:status')}
        </DyoButton>
      </div>
    </SingleFormLayout>
  )
}

export default Page500
