import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import useWebSocket from '@app/hooks/use-websocket'
import { DyoNode, UpdateNodeAgentMessage, WS_TYPE_UPDATE_NODE_AGENT } from '@app/models'
import { nodeWsUrl } from '@app/routes'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'

interface NodeUpdateCardProps {
  className?: string
  node: DyoNode
}

const NodeUpdateCard = (props: NodeUpdateCardProps) => {
  const { t } = useTranslation('nodes')

  const { node, className } = props

  const nodeSocket = useWebSocket(nodeWsUrl(node.id))

  const onUpdateNode = () => {
    nodeSocket.send(WS_TYPE_UPDATE_NODE_AGENT, {
      id: node.id,
    } as UpdateNodeAgentMessage)
  }

  return (
    <DyoCard className={clsx(className, 'p-8 flex flex-col')}>
      <DyoHeading element="h4" className="text-lg text-bright">
        {t('updateNode')}
      </DyoHeading>

      <DyoLabel textColor="text-bright-muted">{t('updateToLatest')}</DyoLabel>

      <DyoButton className="px-6 mt-4 mr-auto" secondary onClick={onUpdateNode} disabled={node.status !== 'running'}>
        {t('update')}
      </DyoButton>
    </DyoCard>
  )
}

export default NodeUpdateCard
