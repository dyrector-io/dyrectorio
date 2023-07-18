import ServiceInfoCard from '@app/components/health/service-info-card'
import { SingleFormLayout } from '@app/components/layout'
import DyoButton from '@app/elements/dyo-button'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DEFAULT_SERVICE_INFO, DyoServiceInfo } from '@app/models'
import { API_STATUS, ROUTE_INDEX } from '@app/routes'
import { fetcher } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import useSWR from 'swr'

const StatusPage = () => {
  const { t } = useTranslation('status')
  const router = useRouter()

  const { data: status, error } = useSWR<DyoServiceInfo, any>(API_STATUS, fetcher)

  const navigateToIndex = async () => await router.push(ROUTE_INDEX)

  if (error) {
    console.error(error)
  }

  const itemClassName = 'lg:w-96'

  return (
    <SingleFormLayout title={t('serviceStatus')}>
      <DyoHeading element="h2" className="self-center text-lg lg:text-2xl text-white font-extrabold mt-auto">
        {t('serviceStatus')}
      </DyoHeading>

      <div className="grid grid-cols-2 self-center mt-12">
        <ServiceInfoCard
          className={itemClassName}
          name={t('app')}
          info={(error || status?.app) ?? DEFAULT_SERVICE_INFO}
        />

        <ServiceInfoCard className={itemClassName} name={t('auth')} info={status?.kratos ?? DEFAULT_SERVICE_INFO} />

        <ServiceInfoCard className={itemClassName} name={t('api')} info={status?.crux ?? DEFAULT_SERVICE_INFO} />

        <ServiceInfoCard
          className={itemClassName}
          name={t('database')}
          info={status?.database ?? DEFAULT_SERVICE_INFO}
        />
      </div>

      <div className="flex flex-row mb-auto mt-12">
        <DyoButton className="px-12" outlined onClick={navigateToIndex}>
          {t('common:dashboard')}
        </DyoButton>
      </div>
    </SingleFormLayout>
  )
}

export default StatusPage
