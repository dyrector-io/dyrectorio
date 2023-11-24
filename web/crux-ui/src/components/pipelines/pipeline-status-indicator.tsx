import DyoIndicator from '@app/elements/dyo-indicator'
import { PipelineRunStatus } from '@app/models'
import useTranslation from 'next-translate/useTranslation'
import { pipelineStatusTranslation } from './pipeline-status-tag'

const statusToColor = (status: PipelineRunStatus) => {
  switch (status) {
    case 'queued':
      return 'bg-dyo-turquoise'
    case 'running':
      return 'bg-warning-orange'
    case 'successful':
      return 'bg-dyo-green'
    case 'failed':
      return 'bg-error-red'
    default:
      return ''
  }
}

type PipelineStatusIndicatorProps = {
  className?: string
  status: PipelineRunStatus
}

const PipelineStatusIndicator = (props: PipelineStatusIndicatorProps) => {
  const { status, className } = props

  const { t } = useTranslation('common')

  return (
    <DyoIndicator className={className} color={statusToColor(status)} title={t(pipelineStatusTranslation(status))} />
  )
}

export default PipelineStatusIndicator
