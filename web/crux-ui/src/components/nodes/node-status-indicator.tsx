import DyoIndicator from '@app/elements/dyo-indicator'
import { NodeStatus } from '@app/models'
import useTranslation from 'next-translate/useTranslation'

const statusToColor = (status: NodeStatus) => {
  switch (status) {
    case 'unreachable':
      return 'bg-dyo-red'
    case 'connected':
      return 'bg-dyo-green'
    case 'outdated':
      return 'bg-dyo-violet'
    default:
      return 'bg-warning-orange'
  }
}

interface NodeStatusStatusIndicatorProps {
  className?: string
  status: NodeStatus
}

const NodeStatusIndicator = (props: NodeStatusStatusIndicatorProps) => {
  const { status, className } = props

  const { t } = useTranslation('common')

  return <DyoIndicator className={className} color={statusToColor(status)} title={t(`nodeStatuses.${status}`)} />
}

export default NodeStatusIndicator
