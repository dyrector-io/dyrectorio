import NodeStatusIndicator from '@app/components/nodes/node-status-indicator'
import Filters from '@app/components/shared/filters'
import { DyoCard } from '@app/elements/dyo-card'
import DyoFilterChips from '@app/elements/dyo-filter-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoIcon from '@app/elements/dyo-icon'
import DyoModal, { DyoConfirmationModal } from '@app/elements/dyo-modal'
import { defaultApiErrorHandler } from '@app/errors'
import useConfirmation from '@app/hooks/use-confirmation'
import { useDeploy } from '@app/hooks/use-deploy'
import { EnumFilter, enumFilterFor, TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import useTeamRoutes from '@app/hooks/use-team-routes'
import useWebSocket from '@app/hooks/use-websocket'
import {
  DeploymentByVersion,
  deploymentIsCopiable,
  deploymentIsDeletable,
  deploymentIsDeployable,
  DeploymentStatus,
  DEPLOYMENT_STATUS_VALUES,
  NodeEventMessage,
  NodeStatus,
  VersionDetails,
  WS_TYPE_NODE_EVENT,
  DyoNode,
  NODE_STATUS_VALUES,
} from '@app/models'
import { utcDateToLocale } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import DeploymentStatusTag from './deployments/deployment-status-tag'
import { VersionActions } from './use-version-state'
import DyoTable, { DyoColumn, sortDate, sortEnum, sortString } from '@app/elements/dyo-table'

interface VersionDeploymentsSectionProps {
  version: VersionDetails
  actions: VersionActions
}

type DeploymentFilter = TextFilter & EnumFilter<DeploymentStatus>

const sortNode = (statuses: Record<string, NodeStatus>) => (a: DyoNode, b: DyoNode) => {
  if (a && b) {
    const aStatus = statuses[a.id]
    const bStatus = statuses[b.id]
    if (aStatus !== bStatus) {
      return sortEnum(NODE_STATUS_VALUES)(aStatus, bStatus)
    }
    return sortString(a.name, b.name)
  }
  if (a) {
    return 1
  }
  if (b) {
    return -1
  }
  return 0
}

const VersionDeploymentsSection = (props: VersionDeploymentsSectionProps) => {
  const { version, actions } = props

  const { t } = useTranslation('versions')
  const routes = useTeamRoutes()

  const router = useRouter()

  const handleApiError = defaultApiErrorHandler(t)

  const [showInfo, setShowInfo] = useState<DeploymentByVersion>(null)
  const [confirmModalConfig, confirm] = useConfirmation()

  const deploy = useDeploy({ router, teamRoutes: routes, t, confirm })

  const filters = useFilters<DeploymentByVersion, DeploymentFilter>({
    filters: [
      textFilterFor<DeploymentByVersion>(it => [it.node.name, it.prefix, it.updatedAt]),
      enumFilterFor<DeploymentByVersion, DeploymentStatus>(it => [it.status]),
    ],
    initialData: version.deployments,
  })

  const [nodeStatuses, setNodeStatuses] = useState<Record<string, NodeStatus>>(() =>
    version.deployments.reduce((prev, it) => ({ ...prev, [it.node.id]: it.node.status }), {}),
  )

  const nodeSock = useWebSocket(routes.node.socket())

  nodeSock.on(WS_TYPE_NODE_EVENT, (message: NodeEventMessage) => {
    const statuses = {
      ...nodeStatuses,
    }

    statuses[message.id] = message.status
    setNodeStatuses(statuses)
  })

  useEffect(() => filters.setItems(version.deployments), [filters, version.deployments, nodeStatuses])

  const onDeploy = async (deployment: DeploymentByVersion) => {
    const confirmed = await confirm({
      title: t('common:areYouSure'),
      description: t('deployments:areYouSureDeployNodePrefix', {
        node: deployment.node.name,
        prefix: deployment.prefix,
      }),
      confirmText: t('common:deploy'),
    })

    if (!confirmed) {
      return
    }

    await deploy({ deploymentId: deployment.id })
  }

  const onDeleteDeployment = async (deployment: DeploymentByVersion) => {
    const confirmed = await confirm({
      title: t('common:areYouSure'),
      description:
        deployment.status === 'successful'
          ? t('deployments:proceedYouDeletePrefix', {
              node: deployment.node.name,
              prefix: deployment.prefix,
            })
          : null,
      confirmText: t('common:delete'),
      confirmColor: 'bg-error-red',
    })

    if (!confirmed) {
      return
    }

    const res = await fetch(routes.deployment.api.details(deployment.id), { method: 'DELETE' })
    if (!res.ok) {
      await handleApiError(res)
      return
    }

    actions.onDeploymentDeleted(deployment.id)
  }

  const onRowClick = async (data: DeploymentByVersion) => await router.push(routes.deployment.details(data.id))

  return (
    <>
      {filters.filtered.length ? (
        <>
          <Filters setTextFilter={it => filters.setFilter({ text: it })}>
            <DyoFilterChips
              className="pl-6"
              selection={filters.filter?.enum}
              choices={DEPLOYMENT_STATUS_VALUES}
              converter={it => t(`common:deploymentStatuses.${it}`)}
              onSelectionChange={type => {
                filters.setFilter({
                  enum: type,
                })
              }}
            />
          </Filters>

          <DyoCard className="mt-4">
            <DyoTable
              data={filters.filtered}
              dataKey="id"
              onRowClick={onRowClick}
              initialSortColumn={2}
              initialSortDirection="asc"
            >
              <DyoColumn
                header={t('common:node')}
                className="w-2/12"
                sortable
                sortField="node"
                sort={sortNode(nodeStatuses)}
                body={(it: DeploymentByVersion) => (
                  <Link
                    className="flex place-items-center cursor-pointer"
                    href={routes.deployment.details(it.id)}
                    passHref
                  >
                    <NodeStatusIndicator className="mr-2" status={nodeStatuses[it.node.id] ?? it.node.status} />
                    {it.node.name}
                  </Link>
                )}
              />
              <DyoColumn header={t('common:prefix')} field="prefix" className="w-2/12" sortable sort={sortString} />
              <DyoColumn
                header={t('common:status')}
                className="w-2/12 text-center"
                sortable
                sortField="status"
                sort={sortEnum(DEPLOYMENT_STATUS_VALUES)}
                body={(it: DeploymentByVersion) => <DeploymentStatusTag className="w-fit m-auto" status={it.status} />}
              />
              <DyoColumn
                header={t('common:date')}
                sortable
                sortField="updatedAt"
                sort={sortDate}
                suppressHydrationWarning
                body={(it: DeploymentByVersion) => utcDateToLocale(it.updatedAt)}
              />
              <DyoColumn
                header={t('common:actions')}
                className="w-48 text-center"
                preventClickThrough
                body={(it: DeploymentByVersion) => (
                  <>
                    <Link className="mr-2 inline-block cursor-pointer" href={routes.deployment.details(it.id)} passHref>
                      <DyoIcon src="/eye.svg" alt={t('common:view')} size="md" />
                    </Link>
                    {deploymentIsDeployable(it.status, version.type) && (
                      <div
                        className={clsx(
                          'mr-2 inline-block',
                          it.node.status === 'connected' ? 'cursor-pointer' : 'cursor-not-allowed opacity-30',
                        )}
                      >
                        <Image
                          src="/deploy.svg"
                          alt={t('common:deploy')}
                          className={
                            it.node.status === 'connected' ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'
                          }
                          width={24}
                          height={24}
                          onClick={() => it.node.status === 'connected' && onDeploy(it)}
                        />
                      </div>
                    )}

                    <div className="mr-2 inline-block">
                      <Image
                        src="/note.svg"
                        alt={t('common:note')}
                        width={24}
                        height={24}
                        className={!!it.note && it.note.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'}
                        onClick={() => !!it.note && it.note.length > 0 && setShowInfo(it)}
                      />
                    </div>

                    {deploymentIsCopiable(it.status) ? (
                      <DyoIcon
                        className={clsx(
                          deploymentIsCopiable(it.status) ? 'cursor-pointer' : 'cursor-not-allowed opacity-30',
                          'aspect-square mr-2',
                        )}
                        src="/copy.svg"
                        alt={t('common:copy')}
                        size="md"
                        onClick={() => actions.copyDeployment(it.id)}
                      />
                    ) : null}

                    {deploymentIsDeletable(it.status) ? (
                      <DyoIcon
                        className="aspect-square cursor-pointer"
                        src="/trash-can.svg"
                        alt={t('common:delete')}
                        size="md"
                        onClick={() => onDeleteDeployment(it)}
                      />
                    ) : null}
                  </>
                )}
              />
            </DyoTable>
          </DyoCard>
        </>
      ) : (
        <DyoHeading element="h3" className="text-md text-center text-light-eased pt-32">
          {t('noDeployments')}
        </DyoHeading>
      )}
      {!showInfo ? null : (
        <DyoModal
          className="w-1/2 h-1/2"
          titleClassName="pl-4 font-medium text-xl text-bright mb-3"
          title={t('common:note')}
          open={!!showInfo}
          onClose={() => setShowInfo(null)}
        >
          <p className="text-bright mt-8 break-all overflow-y-auto">{showInfo.note}</p>
        </DyoModal>
      )}

      <DyoConfirmationModal config={confirmModalConfig} />
    </>
  )
}

export default VersionDeploymentsSection
