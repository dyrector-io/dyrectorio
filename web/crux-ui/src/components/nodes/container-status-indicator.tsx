import DyoIndicator from '@app/elements/dyo-indicator'
import { ContainerState } from '@app/models'
import useTranslation from 'next-translate/useTranslation'

const statusToColor = (status: ContainerState) => {
  switch (status) {
    case 'exited':
    case 'running':
      return 'bg-dyo-green'
    case 'dead':
    case 'restarting':
      return 'bg-dyo-red'
    case 'removing':
      return 'bg-error-red'
    default:
      return 'bg-warning-orange'
  }
}

interface ContainerStatusIndicatorProps {
  className?: string
  state: ContainerState
}

const ContainerStatusIndicator = (props: ContainerStatusIndicatorProps) => {
  const { state, className } = props

  const { t } = useTranslation('common')

  return (
    <DyoIndicator
      className={className}
      color={statusToColor(state)}
      title={state ? t(`containerStatuses.${state}`) : t('errors:notFound')}
    />
  )
}

export default ContainerStatusIndicator
