import DyoIndicator from '@app/elements/dyo-indicator'
import { ServiceStatus } from '@app/models'
import useTranslation from 'next-translate/useTranslation'

const statusToColor = (status: ServiceStatus) => {
  switch (status) {
    case 'operational':
      return 'bg-dyo-green'
    case 'disrupted':
      return 'bg-warning-orange'
    case 'unavailable':
      return 'bg-dyo-red'
    default:
      return 'bg-dyo-red'
  }
}

interface ServiceStatusIndicatorProps {
  className?: string
  status: ServiceStatus
}

const ServiceStatusIndicator = (props: ServiceStatusIndicatorProps) => {
  const { status, className } = props

  const { t } = useTranslation('status')

  return <DyoIndicator className={className} color={statusToColor(status)} title={t(`status.${status}`)} />
}

export default ServiceStatusIndicator
