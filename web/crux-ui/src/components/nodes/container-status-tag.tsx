import DyoTag from '@app/elements/dyo-tag'
import { ContainerState } from '@app/models'
import useTranslation from 'next-translate/useTranslation'

interface ContainerStatusTagProps {
  className?: string
  state: ContainerState
}

const ContainerStatusTag = (props: ContainerStatusTagProps) => {
  const { state, className } = props
  const { t } = useTranslation('common')

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
      color={state ? statusToBgColor() : 'bg-bright'}
      textColor={state ? statusToTextColor() : 'text-bright'}
      className={className}
      solid={state === 'removing'}
    >
      {state ? t(`containerStatuses.${state}`) : t('notFound')}
    </DyoTag>
  )
}

export default ContainerStatusTag
