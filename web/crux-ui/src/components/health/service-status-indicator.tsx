import { ServiceStatus } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'

interface ServiceStatusIndicatorProps {
  className?: string
  status: ServiceStatus
}

const ServiceStatusIndicator = (props: ServiceStatusIndicatorProps) => {
  const { status } = props

  const { t } = useTranslation('500')

  return (
    <div className={clsx(props.className, 'flex')}>
      <Image src={`/${statusToAssetName(status)}.svg`} alt={t(`serviceStatuses.${status}`)} width={16} height={16} />
    </div>
  )
}

export default ServiceStatusIndicator

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
