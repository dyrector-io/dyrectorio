import DyoTag from '@app/elements/dyo-tag'
import { ContainerStatus } from '@app/models'

interface ContainerStatusTagProps {
  className?: string
  status: ContainerStatus
}

const ContainerStatusTag = (props: ContainerStatusTagProps) => {
  const { status } = props

  const statusToBgColor = () => {
    switch (status) {
      case 'exited':
      case 'running':
        return 'bg-dyo-green'
      case 'dead':
      case 'restarting':
        return 'bg-error-red'
      case 'removing':
        return 'bg-dyo-purple'
      default:
        return 'bg-warning-orange'
    }
  }

  const statusToTextColor = () => {
    switch (status) {
      case 'exited':
      case 'running':
        return 'text-dyo-green'
      case 'dead':
      case 'restarting':
        return 'text-error-red'
      case 'removing':
        return 'text-dyo-purple'
      default:
        return 'text-warning-orange'
    }
  }

  return (
    <DyoTag color={statusToBgColor()} textColor={statusToTextColor()} className={props.className}>
      {status.toUpperCase()}
    </DyoTag>
  )
}

export default ContainerStatusTag
