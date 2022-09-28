import ContainerStatusIndicator from '@app/components/nodes/container-status-indicator'
import ContainerStatusTag from '@app/components/nodes/container-status-tag'
import { DyoList } from '@app/elements/dyo-list'
import useWebSocket from '@app/hooks/use-websocket'
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

  const [containers, setContainers] = useState<Container[]>(() =>
    deployment.instances.map(
      it =>
        ({
          id: it.id,
          date: it.image.createdAt,
          state: null,
          name: it.image.config.name,
        } as Container),
    ),
  )

  const sock = useWebSocket(nodeWsUrl(deployment.nodeId), {
    onOpen: () =>
      sock.send(WS_TYPE_WATCH_CONTAINER_STATUS, {
        prefix: deployment.prefix,
        deploymentId: deployment.id,
      } as WatchContainerStatusMessage),
  })

  const merge = (weak: Container[], strong: Container[]): Container[] => {
    if (!strong) {
      return weak
    }

    const result = []
    const prefix = `${deployment.prefix}-`
    const mapped = strong.map(it => {
      if (it.name.startsWith(prefix)) {
        return it.name.substring(prefix.length, it.name.length)
      }

      return it.name
    })

    weak.forEach(it => {
      const index = mapped.indexOf(it.name)
      if (index !== -1) {
        const item = {
          ...strong[index],
          name: mapped[index],
        }
        result.push(item)
      } else {
        result.push(it)
      }
    })

    return result.length !== 0 ? result : strong
  }

  sock.on(WS_TYPE_CONTAINER_STATUS_LIST, (message: ContainerListMessage) => setContainers(merge(containers, message)))

  const itemTemplate = (item: Container) => {
    const now = utcNow()
    const created = new Date(item.date).getTime()
    const seconds = Math.floor((now - created) / 1000)

    /* eslint-disable react/jsx-key */
    return [
      <ContainerStatusIndicator state={item.state} />,
      <span>{item.name}</span>,
      <span>{timeAgo(t, seconds)}</span>,
      <ContainerStatusTag className="inline-block" state={item.state} />,
    ]
    /* eslint-enable react/jsx-key */
  }

  return !containers ? null : <DyoList className="mt-6 mb-2" data={containers} noSeparator itemBuilder={itemTemplate} />
}

export default DeploymentContainerStatusList
