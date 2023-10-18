import ContainerStatusIndicator from '@app/components/nodes/container-status-indicator'
import ContainerStatusTag from '@app/components/nodes/container-status-tag'
import { SECOND_IN_MILLIS } from '@app/const'
import DyoIcon from '@app/elements/dyo-icon'
import { DyoList } from '@app/elements/dyo-list'
import DyoTable, { DyoColumn } from '@app/elements/dyo-table'
import DyoTooltip from '@app/elements/dyo-tooltip'
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
import Link from 'next/link'
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
  instanceId: string
}

const DeploymentContainerStatusList = (props: DeploymentContainerStatusListProps) => {
  const { deployment, progress, className } = props

  const { t } = useTranslation('deployments')
  const routes = useTeamRoutes()

  const now = utcNow()

  const [containers, setContainers] = useState<ContainerWithInstance[]>(() =>
    deployment.instances.map(it => ({
      instanceId: it.id,
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
      labels: {},
    })),
  )

  useInterval(() => {
    setContainers([...containers])
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
            instanceId: it.instanceId,
          }
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

  return !containers ? null : (
    <DyoTable className={className} headless dataKey="instanceId" data={containers}>
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
          progress[it.instanceId]?.progress < 1 ? (
            <div className="relative w-full bg-light-grey-muted rounded-full overflow-hidden">
              <div
                className="z-40 absolute left-0 right-0 top-0 bottom-0 bg-dyo-orange py-1 text-sm font-medium text-white text-center p-0.5"
                style={{ width: `${Math.ceil(progress[it.instanceId].progress * 100)}%` }}
              ></div>
              <div className="relative z-50 py-1 text-sm font-medium text-white text-center p-0.5 leading-none">
                {`${it.imageName}:${it.imageTag}`} - {Math.floor(progress[it.instanceId].progress * 1000) / 10}%
              </div>
            </div>
          ) : (
            <span>{`${it.imageName}:${it.imageTag}`}</span>
          )
        }
      />
      <DyoColumn className="w-2/12" body={(it: Container) => <span>{formatContainerTime(it)}</span>} />
      <DyoColumn
        className="text-center"
        body={(it: Container) => (
          <DyoTooltip className="inline" message={it.reason}>
            <ContainerStatusTag className="inline-block" state={it.state} />
          </DyoTooltip>
        )}
      />
      <DyoColumn
        className="w-24 text-center"
        body={(it: ContainerWithInstance) => (
          <>
            {it.state && (
              <div className="inline-block mr-2">
                <Link href={routes.node.containerLog(deployment.node.id, it.id)} passHref>
                  <DyoIcon src="/note.svg" alt={t('showLogs')} size="md" />
                </Link>
              </div>
            )}
            <Link href={routes.deployment.instanceDetails(deployment.id, it.instanceId)} passHref>
              <DyoIcon src="/instance_config_icon.svg" alt={t('common:instanceConfig')} size="md" />
            </Link>
          </>
        )}
      />
    </DyoTable>
  )
}

export default DeploymentContainerStatusList
