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
    switch (state) {
      case 'exited':
      case 'running':
        return 'text-dyo-green'
      case 'dead':
      case 'restarting':
        return 'text-error-red'
      case 'removing':
        return 'text-dyo-light-purple'
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
