import DyoIndicator from '@app/elements/dyo-indicator'
import { PipelineStatus } from '@app/models'
import useTranslation from 'next-translate/useTranslation'

const statusToColor = (status: PipelineStatus) => {
  switch (status) {
    case 'ready':
      return 'bg-dyo-torquoise'
    case 'running':
      return 'bg-warning-orange'
    case 'successful':
      return 'bg-dyo-green'
    case 'failed':
      return 'bg-error-red'
    default:
      return 'bg-dyo-turquoise'
  }
}

type PipelineStatusIndicatorProps = {
  className?: string
  status: PipelineStatus
}

const PipelineStatusIndicator = (props: PipelineStatusIndicatorProps) => {
  const { status, className } = props

  const { t } = useTranslation('common')

  return <DyoIndicator className={className} color={statusToColor(status)} title={t(`nodeStatuses.${status}`)} />
}

export default PipelineStatusIndicator
