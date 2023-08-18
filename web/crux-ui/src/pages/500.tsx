import { SingleFormLayout } from '@app/components/layout'
import DyoButton from '@app/elements/dyo-button'
import { DyoHeading } from '@app/elements/dyo-heading'
import { ROUTE_INDEX, ROUTE_STATUS } from '@app/routes'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'

const Page500 = () => {
  const { t } = useTranslation('status')
  const router = useRouter()

  const navigateToIndex = async () => await router.push(ROUTE_INDEX)

  return (
    <SingleFormLayout title={t('errors:internalError')}>
      <DyoHeading element="h2" className="self-center text-lg lg:text-2xl text-white font-extrabold mt-auto">
        {t('errors:internalError')}
      </DyoHeading>

      <div className="flex flex-row mb-auto mt-12">
        <DyoButton className="px-12" outlined onClick={navigateToIndex}>
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
