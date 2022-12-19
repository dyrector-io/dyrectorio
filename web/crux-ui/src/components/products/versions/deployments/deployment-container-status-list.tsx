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
import { instanceLogUrl, nodeWsUrl } from '@app/routes'
import { timeAgo, utcNow } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import Link from 'next/link'
import { useState } from 'react'

interface DeploymentContainerStatusListProps {
  deployment: DeploymentRoot
}

type DeploymentContainerInstance = Container & {
  instanceId: string
}

const DeploymentContainerStatusList = (props: DeploymentContainerStatusListProps) => {
  const { deployment } = props

  const { t } = useTranslation('deployments')

  const [containers, setContainers] = useState<DeploymentContainerInstance[]>(() =>
    deployment.instances.map(it => ({
      instanceId: it.id,
      date: it.image.createdAt,
      state: null,
      prefix: deployment.prefix,
      name: it.image.config.name,
      imageName: it.image.name,
      imageTag: it.image.tag,
      ports: [],
    })),
  )

  const sock = useWebSocket(nodeWsUrl(deployment.nodeId), {
    onOpen: () =>
      sock.send(WS_TYPE_WATCH_CONTAINER_STATUS, {
        prefix: deployment.prefix,
        deploymentId: deployment.id,
      } as WatchContainerStatusMessage),
  })

  const merge = (weak: DeploymentContainerInstance[], strong: Container[]): DeploymentContainerInstance[] => {
    if (!strong) {
      return weak
    }

    const prefix = `${deployment.prefix}-`
    const containerNames = strong.map(it => {
      if (it.id && it.name.startsWith(prefix)) {
        // came from docker
        return it.name.substring(prefix.length, it.name.length)
      }

      return it.name
    })

    const result = weak.map(it => {
      const index = containerNames.indexOf(it.name)
      if (index !== -1) {
        return {
          ...strong[index],
          name: containerNames[index],
          instanceId: it.instanceId,
        }
      }
      return it
    })

    if (result.length > 0) {
      return result
    }

    return strong.map(it => {
      const instance = deployment.instances.find(ins => ins.image.name === it.imageName)

      return {
        instanceId: instance.id,
        ...it,
      }
    })
  }

  sock.on(WS_TYPE_CONTAINER_STATUS_LIST, (message: ContainerListMessage) => setContainers(merge(containers, message)))

  const itemTemplate = (item: DeploymentContainerInstance) => {
    const now = utcNow()
    const created = new Date(item.date).getTime()
    const seconds = Math.floor((now - created) / 1000)

    /* eslint-disable react/jsx-key */
    return [
      <ContainerStatusIndicator state={item.state} />,
      <span>{item.name}</span>,
      <span>{`${item.imageName}:${item.imageTag}`}</span>,
      <span>{timeAgo(t, seconds)}</span>,
      <ContainerStatusTag className="inline-block" state={item.state} />,
      item.state && (
        <Link
          href={instanceLogUrl(deployment.product.id, deployment.versionId, deployment.id, item.instanceId)}
          passHref
        >
          <span className="cursor-pointer text-dyo-blue">{t('showLogs')}</span>
        </Link>
      ),
    ]
    /* eslint-enable react/jsx-key */
  }

  return !containers ? null : <DyoList className="mt-6 mb-2" data={containers} noSeparator itemBuilder={itemTemplate} />
}

export default DeploymentContainerStatusList
