import ContainerStatusIndicator from '@app/components/nodes/container-status-indicator'
import ContainerStatusTag from '@app/components/nodes/container-status-tag'
import { SECOND_IN_MILLIS } from '@app/const'
import DyoIcon from '@app/elements/dyo-icon'
import DyoLink from '@app/elements/dyo-link'
import DyoProgress from '@app/elements/dyo-progress'
import DyoTable, { DyoColumn } from '@app/elements/dyo-table'
import useInterval from '@app/hooks/use-interval'
import useTeamRoutes from '@app/hooks/use-team-routes'
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
import { timeAgo, utcNow } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'

export type ContainerProgress = {
  status: string
  progress: number
}

interface DeploymentContainerStatusListProps {
  className?: string
  deployment: DeploymentRoot
  progress: Record<string, ContainerProgress>
}

type ContainerWithInstance = Container & {
  configId: string
}

const DeploymentContainerStatusList = (props: DeploymentContainerStatusListProps) => {
  const { deployment, progress, className } = props

  const { t } = useTranslation('deployments')
  const routes = useTeamRoutes()

  const now = utcNow()

  const [containers, setContainers] = useState<ContainerWithInstance[]>(() =>
    deployment.instances.map(it => ({
      configId: it.config.id,
      id: {
        prefix: deployment.prefix,
        name: it.config.name ?? it.image.config.name,
      },
      createdAt: null,
      state: null,
      reason: null,
      imageName: it.image.name,
      imageTag: it.image.tag,
      ports: [],
      labels: {},
    })),
  )

  useInterval(() => {
    setContainers(it => [...it])
  }, SECOND_IN_MILLIS)

  const sock = useWebSocket(routes.node.detailsSocket(deployment.node.id), {
    onOpen: () =>
      sock.send(WS_TYPE_WATCH_CONTAINERS_STATE, {
        prefix: deployment.prefix,
        deploymentId: deployment.id,
      } as WatchContainerStatusMessage),
  })

  const merge = (weak: ContainerWithInstance[], strong: Container[]): ContainerWithInstance[] => {
    if (!strong || strong.length === 0) {
      return weak
    }

    const containerNames = strong.map(it => containerPrefixNameOf(it.id))

    return weak.map(it => {
      const name = containerPrefixNameOf(it.id)

      const index = containerNames.indexOf(name)
      return index < 0
        ? it
        : {
            ...strong[index],
            configId: it.configId,
          }
    })
  }

  sock.on(WS_TYPE_CONTAINERS_STATE_LIST, (message: ContainersStateListMessage) =>
    setContainers(it => merge(it, message.containers)),
  )

  const formatContainerTime = (container: Container) => {
    if (!container.createdAt) {
      return '-'
    }

    const created = new Date(container.createdAt).getTime()
    const seconds = Math.floor((now - created) / 1000)

    return timeAgo(t, seconds)
  }

  return !containers ? null : (
    <DyoTable className={className} headless dataKey="configId" data={containers}>
      <DyoColumn
        className="w-2/12"
        body={(it: Container) => (
          <div className="flex flex-row items-center">
            <ContainerStatusIndicator className="mr-1" state={it.state} />
            {it.id.name}
          </div>
        )}
      />
      <DyoColumn
        className="w-4/12"
        body={(it: ContainerWithInstance) =>
          progress[it.configId]?.progress < 1 ? (
            <DyoProgress progress={progress[it.configId].progress} text={`${it.imageName}:${it.imageTag}`} />
          ) : (
            <span>{`${it.imageName}:${it.imageTag}`}</span>
          )
        }
      />
      <DyoColumn className="w-2/12" body={(it: Container) => <span>{formatContainerTime(it)}</span>} />
      <DyoColumn
        className="text-center"
        body={(it: Container) => <ContainerStatusTag className="inline-block" state={it.state} title={it.reason} />}
      />
      <DyoColumn
        className="w-24 text-center"
        body={(it: ContainerWithInstance) => (
          <>
            {it.state && (
              <div className="inline-block mr-2">
                <DyoLink
                  href={routes.node.containerLog(deployment.node.id, it.id)}
                  qaLabel="container-status-list-logs-icon"
                >
                  <DyoIcon src="/note.svg" alt={t('showLogs')} size="md" />
                </DyoLink>
              </div>
            )}

            <DyoLink href={routes.containerConfig.details(it.configId)} qaLabel="container-status-instance-config-icon">
              <DyoIcon src="/concrete_container_config.svg" alt={t('common:instanceConfig')} size="md" />
            </DyoLink>
          </>
        )}
      />
    </DyoTable>
  )
}

export default DeploymentContainerStatusList
