import DyoTag from '@app/elements/dyo-tag'
import { DeploymentStatus } from '@app/models'
import useTranslation from 'next-translate/useTranslation'

const statusToBgColor = (status: DeploymentStatus) => {
  switch (status) {
    case 'failed':
      return 'bg-error-red'
    case 'in-progress':
      return 'bg-warning-orange'
    case 'obsolete':
      return 'bg-dyo-purple'
    case 'preparing':
      return 'bg-dyo-turquoise'
    case 'successful':
      return 'bg-dyo-green'
    default:
      return null
  }
}

const statusToTextColor = (status: DeploymentStatus) => {
  switch (status) {
    case 'failed':
      return 'text-error-red'
    case 'in-progress':
      return 'text-warning-orange'
    case 'obsolete':
      return 'text-dyo-purple-light'
    case 'preparing':
      return 'text-dyo-turquoise'
    case 'successful':
      return 'text-dyo-green'
    default:
      return null
  }
}

export const deploymentStatusTranslation = (status: DeploymentStatus | 'all'): string => {
  switch (status) {
    case 'successful':
    case 'failed':
      return `common:${status}`
    default:
      return `common:deploymentStatuses.${status}`
  }
}

interface DeploymentStatusTagProps {
  className?: string
  status: DeploymentStatus
}

const DeploymentStatusTag = (props: DeploymentStatusTagProps) => {
  const { status, className } = props

  const { t } = useTranslation('common')

  return (
    <DyoTag
      color={statusToBgColor(status)}
      textColor={statusToTextColor(status)}
      className={className}
      solid={status === 'obsolete'}
    >
      {t(deploymentStatusTranslation(status))}
    </DyoTag>
  )
}

export default DeploymentStatusTag
