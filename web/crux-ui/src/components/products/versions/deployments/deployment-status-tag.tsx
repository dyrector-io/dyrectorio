import DyoTag from '@app/elements/dyo-tag'
import { DeploymentStatus } from '@app/models'
import useTranslation from 'next-translate/useTranslation'

interface DeploymentStatusTagProps {
  className?: string
  status: DeploymentStatus
}

const DeploymentStatusTag = (props: DeploymentStatusTagProps) => {
  const { status } = props

  const { t } = useTranslation('common')

  const statusToBgColor = () => {
    switch (status) {
      case 'failed':
        return 'bg-error-red'
      case 'in_progress':
        return 'bg-warning-orange'
      case 'obsolate':
        return 'bg-dyo-purple'
      case 'preparing':
        return 'bg-dyo-turquoise'
      case 'successful':
        return 'bg-dyo-green'
      default:
        return null
    }
  }

  const statusToTextColor = () => {
    switch (status) {
      case 'failed':
        return 'text-error-red'
      case 'in_progress':
        return 'text-warning-orange'
      case 'obsolate':
        return 'text-dyo-purple-light'
      case 'preparing':
        return 'text-dyo-turquoise'
      case 'successful':
        return 'text-dyo-green'
      default:
        return null
    }
  }

  return (
    <DyoTag
      color={statusToBgColor()}
      textColor={statusToTextColor()}
      className={props.className}
      solid={status === 'obsolate'}
    >
      {t(`deploymentStatuses.${status}`)}
    </DyoTag>
  )
}

export default DeploymentStatusTag
