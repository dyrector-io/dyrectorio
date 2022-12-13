import DyoIcon from '@app/elements/dyo-icon'
import { ServiceStatus } from '@app/models'
import useTranslation from 'next-translate/useTranslation'

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

interface ServiceStatusIndicatorProps {
  className?: string
  status: ServiceStatus
}

const ServiceStatusIndicator = (props: ServiceStatusIndicatorProps) => {
  const { status, className } = props

  const { t } = useTranslation('status')

  return <DyoIcon className={className} src={`/${statusToAssetName(status)}.svg`} alt={t(`status.${status}`)} />
}

export default ServiceStatusIndicator
