import NodeStatusIndicator from '@app/components/nodes/node-status-indicator'
import Filters from '@app/components/shared/filters'
import { DyoCard } from '@app/elements/dyo-card'
import DyoFilterChips from '@app/elements/dyo-filter-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoIcon from '@app/elements/dyo-icon'
import { DyoList } from '@app/elements/dyo-list'
import DyoModal, { DyoConfirmationModal } from '@app/elements/dyo-modal'
import { defaultApiErrorHandler } from '@app/errors'
import useConfirmation from '@app/hooks/use-confirmation'
import { useDeploy } from '@app/hooks/use-deploy'
import { EnumFilter, enumFilterFor, TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import { dateSort, enumSort, sortHeaderBuilder, stringSort, useSorting } from '@app/hooks/use-sorting'
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

interface VersionDeploymentsSectionProps {
  version: VersionDetails
  actions: VersionActions
}

type DeploymentFilter = TextFilter & EnumFilter<DeploymentStatus>
type DeploymentSorting = 'node' | 'prefix' | 'updatedAt' | 'status'

const nodeSort = (a: DyoNode, b: DyoNode) => {
  if (a && b) {
    if (a.status !== b.status) {
      return enumSort(NODE_STATUS_VALUES)(a.status, b.status)
    }
    return stringSort(a.name, b.name)
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

  const filters = useFilters<DeploymentByVersion, DeploymentFilter>({
    filters: [
      textFilterFor<DeploymentByVersion>(it => [it.node.name, it.prefix, it.updatedAt]),
      enumFilterFor<DeploymentByVersion, DeploymentStatus>(it => [it.status]),
    ],
    initialData: version.deployments,
  })

  const sorting = useSorting<DeploymentByVersion, DeploymentSorting>(filters.filtered, {
    initialField: 'updatedAt',
    initialDirection: 'asc',
    sortFunctions: {
      node: nodeSort,
      prefix: stringSort,
      status: enumSort(DEPLOYMENT_STATUS_VALUES),
      updatedAt: dateSort,
    },
    fieldGetters: {
      node: it => it.node,
    },
  })

  useEffect(() => filters.setItems(version.deployments), [filters, version.deployments])

  const [nodeStatuses, setNodeStatuses] = useState<Record<string, NodeStatus>>({})

  const nodeSock = useWebSocket(routes.node.socket())

  nodeSock.on(WS_TYPE_NODE_EVENT, (message: NodeEventMessage) => {
    const statuses = {
      ...nodeStatuses,
    }

    statuses[message.id] = message.status

    setNodeStatuses(statuses)
  })

  const headers = ['common:node', 'common:prefix', 'common:status', 'common:date', 'common:actions']
  const defaultHeaderClass = 'h-11 uppercase text-bright text-sm bg-medium-eased px-2 py-3 font-semibold'
  const headerClasses = [
    clsx('rounded-tl-lg pl-6', defaultHeaderClass),
    defaultHeaderClass,
    clsx('text-center', defaultHeaderClass),
    defaultHeaderClass,
    clsx('rounded-tr-lg pr-6 text-center', defaultHeaderClass),
  ]

  const defaultItemClass = 'h-11 min-h-min text-light-eased p-2 w-fit'
  const itemClasses = [
    clsx('pl-6', defaultItemClass),
    ...Array.from({ length: 1 }).map(() => defaultItemClass),
    clsx('text-center', defaultItemClass),
    ...Array.from({ length: headerClasses.length - 4 }).map(() => defaultItemClass),
    clsx('pr-6 text-center', defaultItemClass),
  ]

  const onCellClick = async (data: DeploymentByVersion, row: number, col: number) => {
    if (col >= headers.length - 1) {
      return
    }

    await router.push(routes.deployment.details(data.id))
  }

  const itemTemplate = (item: DeploymentByVersion) => {
    const deployable = deploymentIsDeployable(item.status, version.type)

    /* eslint-disable react/jsx-key */
    return [
      <Link className="flex place-items-center cursor-pointer" href={routes.deployment.details(item.id)} passHref>
        <NodeStatusIndicator className="mr-2" status={item.node.status} />
        {item.node.name}
      </Link>,
      item.prefix,
      <DeploymentStatusTag className="w-fit m-auto" status={item.status} />,
      <span suppressHydrationWarning>{utcDateToLocale(item.updatedAt)}</span>,
      <div className="flex justify-center">
        <Link className="mr-2 inline-block cursor-pointer" href={routes.deployment.details(item.id)} passHref>
          <DyoIcon src="/eye.svg" alt={t('common:view')} size="md" />
        </Link>
        {deployable && (
          <div
            className={clsx(
              'mr-2 inline-block',
              item.node.status === 'connected' ? 'cursor-pointer' : 'cursor-not-allowed opacity-30',
            )}
          >
            <Image
              src="/deploy.svg"
              alt={t('common:deploy')}
              className={item.node.status === 'connected' ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'}
              width={24}
              height={24}
              onClick={() => item.node.status === 'connected' && onDeploy(item)}
            />
          </div>
        )}

        <div className="mr-2 inline-block">
          <Image
            src="/note.svg"
            alt={t('common:note')}
            width={24}
            height={24}
            className={!!item.note && item.note.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'}
            onClick={() => !!item.note && item.note.length > 0 && setShowInfo(item)}
          />
        </div>

        {deploymentIsCopiable(item.status) ? (
          <DyoIcon
            className={clsx(
              deploymentIsCopiable(item.status) ? 'cursor-pointer' : 'cursor-not-allowed opacity-30',
              'aspect-square mr-2',
            )}
            src="/copy.svg"
            alt={t('common:copy')}
            size="md"
            onClick={() => actions.copyDeployment(item.id)}
          />
        ) : null}

        {deploymentIsDeletable(item.status) ? (
          <DyoIcon
            className="aspect-square cursor-pointer"
            src="/trash-can.svg"
            alt={t('common:delete')}
            size="md"
            onClick={() => onDeleteDeployment(item)}
          />
        ) : null}
      </div>,
    ]
    /* eslint-enable react/jsx-key */
  }

  return (
    <>
      {sorting.items.length ? (
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
            <DyoList
              headerClassName={headerClasses}
              headers={headers}
              itemClassName={itemClasses}
              noSeparator
              data={sorting.items}
              itemBuilder={itemTemplate}
              headerBuilder={sortHeaderBuilder<DeploymentByVersion, DeploymentSorting>(
                sorting,
                {
                  'common:node': 'node',
                  'common:prefix': 'prefix',
                  'common:status': 'status',
                  'common:date': 'updatedAt',
                },
                text => t(text),
              )}
              cellClick={onCellClick}
            />
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
