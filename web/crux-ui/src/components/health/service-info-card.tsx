import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { ServiceInfo } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import ServiceStatusIndicator from './service-status-indicator'
import ServiceStatusTag from './service-status-tag'

interface ServiceStatusCardProps {
  className?: string
  name: string
  info: ServiceInfo
}

const ServiceInfoCard = (props: ServiceStatusCardProps) => {
  const { t } = useTranslation('status')

  const { info } = props

  return (
    <DyoCard className={clsx(props.className, 'flex flex-col p-8 m-4')}>
      <div className="flex flex-row flex-grow">
        <DyoHeading element="h3" className="text-xl text-white">
          {props.name}
        </DyoHeading>

        <ServiceStatusIndicator className="ml-auto pl-8 py-auto" status={info.status} />
      </div>

      <ServiceStatusTag className="mx-auto mt-12" status={info.status} />

      <span className="text-bright mx-auto mt-4">{`${t('version')}: ${info.version ?? t('unknown')}`}</span>
    </DyoCard>
  )
}

export default ServiceInfoCard
