import ContainerStatusIndicator from '@app/components/nodes/container-status-indicator'
import ContainerStatusTag from '@app/components/nodes/container-status-tag'
import { DyoList } from '@app/elements/dyo-list'
import { useWebSocket } from '@app/hooks/use-websocket'
import {
  Container,
  ContainerListMessage,
  DeploymentRoot,
  WatchContainerStatusMessage,
  WS_TYPE_CONTAINER_STATUS_LIST,
  WS_TYPE_WATCH_CONTAINER_STATUS,
} from '@app/models'
import { nodeWsUrl } from '@app/routes'
import { timeAgo, utcNow } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'

interface DeploymentContainerStatusListProps {
  deployment: DeploymentRoot
}

const DeploymentContainerStatusList = (props: DeploymentContainerStatusListProps) => {
  const { deployment } = props

  const { t } = useTranslation('deployments')

  const [containers, setContainers] = useState<Container[]>()

  const sock = useWebSocket(nodeWsUrl(deployment.nodeId), {
    onOpen: () =>
      sock.send(WS_TYPE_WATCH_CONTAINER_STATUS, {
        prefix: deployment.prefix,
      } as WatchContainerStatusMessage),
  })

  sock.on(WS_TYPE_CONTAINER_STATUS_LIST, (message: ContainerListMessage) => setContainers(message))

  return !containers ? null : (
    <DyoList
      className="mt-6 mb-2"
      data={containers}
      noSeparator
      itemBuilder={it => {
        const now = utcNow()
        const created = new Date(it.date).getTime()
        const seconds = Math.floor((now - created) / 1000)

        /* eslint-disable react/jsx-key */
        return [
          <ContainerStatusIndicator state={it.state} />,
          <span>{it.name}</span>,
          <span>{timeAgo(t, seconds)}</span>,
          <ContainerStatusTag className="inline-block" state={it.state} />,
        ]
        /* eslint-enable react/jsx-key */
      }}
    />
  )
}

export default DeploymentContainerStatusList
