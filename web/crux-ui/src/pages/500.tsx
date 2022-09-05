import { SingleFormLayout } from '@app/components/layout'
import DyoButton from '@app/elements/dyo-button'
import { DyoHeading } from '@app/elements/dyo-heading'
import { ROUTE_STATUS } from '@app/routes'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'

const Page500 = () => {
  const { t } = useTranslation('status')
  const router = useRouter()

  const goBack = () => router.back()

  const checkStatus = () => router.push(ROUTE_STATUS)

  return (
    <SingleFormLayout title={t('errors:internalError')}>
      <DyoHeading element="h2" className="self-center text-lg lg:text-2xl text-white font-extrabold mt-auto">
        {t('errors:internalError')}
      </DyoHeading>

      <div className="flex flex-row mb-auto mt-12">
        <DyoButton className="ml-auto mr-2 px-10 mb-auto" secondary outlined onClick={goBack}>
          {t('common:goBack')}
        </DyoButton>

        <DyoButton className="ml-2 mr-auto px-12" onClick={checkStatus}>
          {t('common:status')}
        </DyoButton>
      </div>
    </SingleFormLayout>
  )
}

export default Page500
