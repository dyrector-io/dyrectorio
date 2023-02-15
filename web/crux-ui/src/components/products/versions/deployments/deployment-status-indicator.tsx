import DyoIcon from '@app/elements/dyo-icon'
import { DeploymentStatus } from '@app/models'
import useTranslation from 'next-translate/useTranslation'

const statusToAssetName = (status: DeploymentStatus) => {
  switch (status) {
    case 'successful':
      return 'circle-green'
    case 'failed':
      return 'circle-red'
    case 'obsolete':
      return 'circle-red-orange'
    default:
      return 'circle-orange'
  }
}

interface DeploymentStatusIndicatorProps {
  className?: string
  status: DeploymentStatus
}

const DeploymentStatusIndicator = (props: DeploymentStatusIndicatorProps) => {
  const { status, className } = props

  const { t } = useTranslation('common')

  const asset = statusToAssetName(status)

  return <DyoIcon className={className} src={`/${asset}.svg`} alt={t(`deploymentStatuses.${status}`)} />
}

export default DeploymentStatusIndicator
