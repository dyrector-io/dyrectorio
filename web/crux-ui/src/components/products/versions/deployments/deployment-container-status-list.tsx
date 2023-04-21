import ContainerStatusIndicator from '@app/components/nodes/container-status-indicator'
import ContainerStatusTag from '@app/components/nodes/container-status-tag'
import { DyoList } from '@app/elements/dyo-list'
import useWebSocket from '@app/hooks/use-websocket'
import {
  Container,
  containerPrefixNameOf,
  ContainersStateListMessage,
  DeploymentRoot,
  WatchContainerStatusMessage,
  WS_TYPE_CONTAINERS_STATE_LIST,
  WS_TYPE_WATCH_CONTAINERS_STATE,
} from '@app/models'
import { deploymentContainerLogUrl, nodeWsUrl } from '@app/routes'
import { timeAgo, utcNow } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import Link from 'next/link'
import { useState } from 'react'

interface DeploymentContainerStatusListProps {
  deployment: DeploymentRoot
}

const DeploymentContainerStatusList = (props: DeploymentContainerStatusListProps) => {
  const { deployment } = props

  const { t } = useTranslation('deployments')

  const [containers, setContainers] = useState<Container[]>(() =>
    deployment.instances.map(it => ({
      id: {
        prefix: deployment.prefix,
        name: it.config?.name ?? it.image.config.name,
      },
      date: it.image.createdAt,
      state: null,
      imageName: it.image.name,
      imageTag: it.image.tag,
      ports: [],
    })),
  )

  const sock = useWebSocket(nodeWsUrl(deployment.node.id), {
    onOpen: () =>
      sock.send(WS_TYPE_WATCH_CONTAINERS_STATE, {
        prefix: deployment.prefix,
        deploymentId: deployment.id,
      } as WatchContainerStatusMessage),
  })

  const merge = (weak: Container[], strong: Container[]): Container[] => {
    if (!strong) {
      return weak
    }

    const containerNames = strong.map(it => containerPrefixNameOf(it.id))

    return weak.map(it => {
      const name = containerPrefixNameOf(it.id)

      const index = containerNames.indexOf(name)
      return index < 0 ? it : strong[index]
    })
  }

  sock.on(WS_TYPE_CONTAINERS_STATE_LIST, (message: ContainersStateListMessage) =>
    setContainers(merge(containers, message.containers)),
  )

  const itemTemplate = (container: Container) => {
    const now = utcNow()
    const created = new Date(container.date).getTime()
    const seconds = Math.floor((now - created) / 1000)

    const logUrl = deploymentContainerLogUrl(deployment.id, container.id)

    /* eslint-disable react/jsx-key */
    return [
      <ContainerStatusIndicator state={container.state} />,
      <span>{container.id.name}</span>,
      <span>{`${container.imageName}:${container.imageTag}`}</span>,
      <span>{timeAgo(t, seconds)}</span>,
      <ContainerStatusTag className="inline-block" state={container.state} />,
      container.state && (
        <Link href={logUrl} passHref>
          <span className="cursor-pointer text-dyo-blue">{t('showLogs')}</span>
        </Link>
      ),
    ]
    /* eslint-enable react/jsx-key */
  }

  return !containers ? null : <DyoList className="mt-6 mb-2" data={containers} noSeparator itemBuilder={itemTemplate} />
}

export default DeploymentContainerStatusList
