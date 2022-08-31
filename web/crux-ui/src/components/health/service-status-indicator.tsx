import { ServiceStatus } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'

interface ServiceStatusIndicatorProps {
  className?: string
  status: ServiceStatus
}

const statusToAssetName = (status: ServiceStatus) => {
  switch (status) {
    case 'operational':
      return 'circle-green'
    case 'disrupted':
      return 'circle-orange'
    case 'unavailable':
      return 'circle-red'
    default:
      return 'circle-red'
  }
}

const ServiceStatusIndicator = (props: ServiceStatusIndicatorProps) => {
  const { status, className } = props

  const { t } = useTranslation('500')

  return (
    <div className={clsx(className, 'flex')}>
      <Image
        src={`/${statusToAssetName(status)}.svg`}
        alt={t(`serviceStatuses.${status}`)}
        width={16}
        height={16}
        layout="fixed"
      />
    </div>
  )
}

export default ServiceStatusIndicator
