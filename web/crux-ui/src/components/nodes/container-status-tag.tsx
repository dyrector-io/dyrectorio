import DyoTag from '@app/elements/dyo-tag'
import { ContainerState } from '@app/models'

interface ContainerStatusTagProps {
  className?: string
  state: ContainerState
}

const ContainerStatusTag = (props: ContainerStatusTagProps) => {
  const { state } = props

  const statusToBgColor = () => {
    switch (state) {
      case 'running':
        return 'bg-dyo-green'
      case 'exited':
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
    switch (state) {
      case 'running':
        return 'text-dyo-green'
      case 'exited':
      case 'dead':
      case 'restarting':
        return 'text-error-red'
      case 'removing':
        return 'text-dyo-purple-light'
      default:
        return 'text-warning-orange'
    }
  }

  return (
    <DyoTag
      color={statusToBgColor()}
      textColor={statusToTextColor()}
      className={props.className}
      solid={state === 'removing'}
    >
      {state.toUpperCase()}
    </DyoTag>
  )
}

export default ContainerStatusTag
