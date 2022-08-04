import ServiceStatusCard from '@app/components/health/service-status-card'
import { PageHead, SingleFormLayout } from '@app/components/layout'
import { DyoButton } from '@app/elements/dyo-button'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoServiceStatus } from '@app/models'
import { API_STATUS } from '@app/routes'
import { fetcher } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import useSWR from 'swr'

const Page500 = () => {
  const { t } = useTranslation('500')
  const router = useRouter()

  const { data: status, error } = useSWR<DyoServiceStatus, any>(API_STATUS, fetcher)

  const goBack = () => router.back()

  if (error) {
    console.error(error)
  }

  return (
    <>
      <PageHead title={t('title')} />
      <SingleFormLayout>
        <DyoHeading element="h2" className="self-center text-2xl text-white font-extrabold mt-auto">
          {t('serviceStatus')}
        </DyoHeading>

        <div className="flex flex-row justify-center mt-12">
          <ServiceStatusCard className="w-1/5" name={t('auth')} status={status?.kratos ?? 'unavailable'} />

          <ServiceStatusCard className="w-1/5" name={t('api')} status={status?.crux ?? 'unavailable'} />
        </div>

        <DyoButton className="mx-auto px-12 mt-12 mb-auto" secondary outlined onClick={goBack}>
          {t('common:goBack')}
        </DyoButton>
      </SingleFormLayout>
    </>
  )
}

export default Page500
