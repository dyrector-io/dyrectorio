import DyoTag from '@app/elements/dyo-tag'
import { ContainerState } from '@app/models'
import useTranslation from 'next-translate/useTranslation'

interface ContainerStatusTagProps {
  className?: string
  state: ContainerState
  title?: string
}

const ContainerStatusTag = (props: ContainerStatusTagProps) => {
  const { state, className, title } = props

  const { t } = useTranslation('common')

  const statusToBgColor = () => {
    switch (state) {
      case 'running':
        return 'bg-dyo-green'
      case 'exited':
        return 'bg-error-red'
      case 'waiting':
        return 'bg-warning-orange'
      default:
        return 'bg-warning-orange'
    }
  }

  const statusToTextColor = () => {
    switch (state) {
      case 'running':
        return 'text-dyo-green'
      case 'exited':
        return 'text-error-red'
      case 'waiting':
        return 'text-warning-orange'
      default:
        return 'text-warning-orange'
    }
  }

  return (
    <DyoTag
      color={state ? statusToBgColor() : 'bg-bright'}
      textColor={state ? statusToTextColor() : 'text-bright'}
      className={className}
      title={title}
    >
      {state ? t(`containerStatuses.${state}`) : t('errors:notFound')}
    </DyoTag>
  )
}

export default ContainerStatusTag
