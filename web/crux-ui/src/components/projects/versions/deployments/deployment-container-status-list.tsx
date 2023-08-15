import ContainerStatusIndicator from '@app/components/nodes/container-status-indicator'
import ContainerStatusTag from '@app/components/nodes/container-status-tag'
import DyoIcon from '@app/elements/dyo-icon'
import { DyoList } from '@app/elements/dyo-list'
import useTeamRoutes from '@app/hooks/use-team-routes'
import useWebSocket from '@app/hooks/use-websocket'
import {
  Container,
  ContainerIdentifier,
  containerPrefixNameOf,
  ContainersStateListMessage,
  DeploymentRoot,
  WatchContainerStatusMessage,
  WS_TYPE_CONTAINERS_STATE_LIST,
  WS_TYPE_WATCH_CONTAINERS_STATE,
} from '@app/models'
import { timeAgo, utcNow } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface DeploymentContainerStatusListProps {
  deployment: DeploymentRoot
}

type ContainerInstance = {
  id: ContainerIdentifier,
  instanceId: string,
}

const DeploymentContainerStatusList = (props: DeploymentContainerStatusListProps) => {
  const { t } = useTranslation('deployments')
  const routes = useTeamRoutes()

  const { deployment } = props
  const now = utcNow()


  const [instanceId, setInstanceId] = useState<ContainerInstance[]>()
  const [containers, setContainers] = useState<Container[]>(() =>
    deployment.instances.map(it => ({
      id: {
        prefix: deployment.prefix,
        name: it.config?.name ?? it.image.config.name,
      },
      createdAt: null,
      state: null,
      reason: null,
      imageName: it.image.name,
      imageTag: it.image.tag,
      ports: [],
    })),
  )

  const sock = useWebSocket(routes.node.detailsSocket(deployment.node.id), {
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

  const formatContainerTime = (container: Container) => {
    if (!container.createdAt) {
      return '-'
    }

    const created = new Date(container.createdAt).getTime()
    const seconds = Math.floor((now - created) / 1000)

    return timeAgo(t, seconds)
  }

  const getInstanceId = (container: Container) => {
    return instanceId?.find(it => it.id.name === container.id.name && it.id.prefix === container.id.prefix)?.instanceId
  }

  useEffect(() => {
    setInstanceId(() =>
      deployment.instances.map(it => ({
        id: {
          prefix: deployment.prefix,
          name: it.config?.name ?? it.image.config.name,
        },
        instanceId: it.id,
      }))
    )
  }, [deployment])

  const itemTemplate = (container: Container) => {
    const logUrl = routes.node.containerLog(deployment.node.id, container.id)

    /* eslint-disable react/jsx-key */
    return [
      <ContainerStatusIndicator state={container.state} />,
      <span>{container.id.name}</span>,
      <span>{`${container.imageName}:${container.imageTag}`}</span>,
      <span>{formatContainerTime(container)}</span>,
      <ContainerStatusTag className="inline-block" state={container.state} />,
      <span>{container.reason}</span>,
      <span className='flex flex-row mr-14 justify-end'>
        {container.state && (
          <div className='inline-block mr-2'>
            <Link href={logUrl} passHref>
              <DyoIcon src="/note.svg" alt={t('showLogs')} size="md" />
            </Link>
          </div>
        )}
        {instanceId?.length > 0 && (
          <Link href={routes.deployment.instanceDetails(deployment.id, getInstanceId(container))} passHref>
            <DyoIcon src="/instance_config_icon.svg" alt={t('common:settings')} size="md" />
          </Link>
        )}
      </span>
    ]
    /* eslint-enable react/jsx-key */
  }

  return !containers ? null : <DyoList className="mt-6 mb-2" data={containers} noSeparator itemBuilder={itemTemplate} />
}

export default DeploymentContainerStatusList
