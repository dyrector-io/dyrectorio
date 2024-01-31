import DyoTag from '@app/elements/dyo-tag'
import { PipelineRunStatus } from '@app/models'
import useTranslation from 'next-translate/useTranslation'

const statusToBgColor = (status: PipelineRunStatus) => {
  switch (status) {
    case 'failed':
      return 'bg-error-red'
    case 'running':
      return 'bg-warning-orange'
    case 'queued':
      return 'bg-dyo-turquoise'
    case 'successful':
      return 'bg-dyo-green'
    default:
      return null
  }
}

const statusToTextColor = (status: PipelineRunStatus) => {
  switch (status) {
    case 'failed':
      return 'text-error-red'
    case 'running':
      return 'text-warning-orange'
    case 'queued':
      return 'text-dyo-turquoise'
    case 'successful':
      return 'text-dyo-green'
    default:
      return null
  }
}

export const pipelineStatusTranslation = (status: PipelineRunStatus): string => {
  switch (status) {
    case 'successful':
    case 'failed':
      return `common:${status}`
    default:
      return `common:pipelineStatuses.${status}`
  }
}

interface PipelineStatusTagProps {
  className?: string
  status: PipelineRunStatus
}

const PipelineRunStatusTag = (props: PipelineStatusTagProps) => {
  const { status, className } = props

  const { t } = useTranslation('common')

  return (
    <DyoTag color={statusToBgColor(status)} textColor={statusToTextColor(status)} className={className}>
      {t(pipelineStatusTranslation(status))}
    </DyoTag>
  )
}

export default PipelineRunStatusTag
