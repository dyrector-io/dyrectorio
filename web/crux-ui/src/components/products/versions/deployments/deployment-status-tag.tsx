import DyoTag from '@app/elements/dyo-tag'
import { DeploymentStatus } from '@app/models'

interface DeploymentStatusTagProps {
  className?: string
  status: DeploymentStatus
}

const DeploymentStatusTag = (props: DeploymentStatusTagProps) => {
  const { status } = props

  const statusToBgColor = () => {
    switch (status) {
      case 'failed':
        return 'bg-error-red'
      case 'inProgress':
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
      case 'inProgress':
        return 'text-warning-orange'
      case 'obsolate':
        return 'text-dyo-purple'
      case 'preparing':
        return 'text-dyo-turquoise'
      case 'successful':
        return 'text-dyo-green'
      default:
        return null
    }
  }

  return (
    <DyoTag color={statusToBgColor()} textColor={statusToTextColor()} className={props.className}>
      {status.toUpperCase()}
    </DyoTag>
  )
}

export default DeploymentStatusTag
