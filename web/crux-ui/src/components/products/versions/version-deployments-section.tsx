import NodeStatusIndicator from '@app/components/nodes/node-status-indicator'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoList } from '@app/elements/dyo-list'
import { DyoSelect } from '@app/elements/dyo-select'
import { EnumFilter, enumFilterFor, TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import useWebSocket from '@app/hooks/use-websocket'
import {
  DeploymentByVersion,
  deploymentIsMutable,
  DeploymentStatus,
  DEPLOYMENT_STATUS_VALUES,
  GetNodeStatusListMessage,
  NodeStatus,
  NodeStatusMessage,
  ProductDetails,
  VersionDetails,
  WS_TYPE_GET_NODE_STATUS_LIST,
  WS_TYPE_NODE_STATUS,
  WS_TYPE_NODE_STATUSES,
} from '@app/models'
import { deploymentDeployUrl, deploymentUrl, WS_NODES } from '@app/routes'
import { distinct } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import Image from 'next/image'
import { useState } from 'react'
import DeploymentStatusTag from './deployments/deployment-status-tag'

interface VersionDeploymentsSectionProps {
  product: ProductDetails
  version: VersionDetails
}

type DeploymentFilter = TextFilter & EnumFilter<DeploymentStatus>

const VersionDeploymentsSection = (props: VersionDeploymentsSectionProps) => {
  const { version, product } = props

  const { t } = useTranslation('versions')

  const router = useRouter()

  const filters = useFilters<DeploymentByVersion, DeploymentFilter>({
    filters: [
      textFilterFor<DeploymentByVersion>(it => [it.name, it.nodeName, it.prefix, it.status, it.date]),
      enumFilterFor<DeploymentByVersion, DeploymentStatus>(it => [it.status]),
    ],
    initialData: version.deployments,
    initialFilter: { text: '' },
  })

  const [nodeStatuses, setNodeStatuses] = useState<Record<string, NodeStatus>>({})

  const nodeSock = useWebSocket(WS_NODES, {
    onOpen: () =>
      nodeSock.send(WS_TYPE_GET_NODE_STATUS_LIST, {
        nodeIds: distinct(filters.items.map(it => it.nodeId)),
      } as GetNodeStatusListMessage),
  })

  const updateNodeStatuses = (message: NodeStatusMessage[]) => {
    const statuses = {
      ...nodeStatuses,
    }

    message.forEach(it => {
      statuses[it.nodeId] = it.status
    })

    setNodeStatuses(statuses)
  }

  nodeSock.on(WS_TYPE_NODE_STATUSES, updateNodeStatuses)

  nodeSock.on(WS_TYPE_NODE_STATUS, (message: NodeStatusMessage) => updateNodeStatuses([message]))

  const onNavigateToDeployment = (deployment: DeploymentByVersion) =>
    router.push(deploymentUrl(product.id, version.id, deployment.id))

  const onDeploy = (deployment: DeploymentByVersion) =>
    router.push(deploymentDeployUrl(product.id, version.id, deployment.id))

  const headers = [
    ...['deploymentName', 'common:node', 'common:prefix', 'common:status', 'common:date', 'actions'].map(it => t(it)),
  ]
  const defaultHeaderClass = 'h-11 uppercase text-bright text-sm bg-medium-eased py-3 pl-4 font-semibold'
  const headerClasses = [
    clsx('rounded-tl-lg', defaultHeaderClass),
    defaultHeaderClass,
    defaultHeaderClass,
    clsx('text-center', defaultHeaderClass),
    defaultHeaderClass,
    clsx('rounded-tr-lg', defaultHeaderClass),
  ]

  const itemTemplate = (item: DeploymentByVersion) => {
    const mutable = deploymentIsMutable(item.status)

    /* eslint-disable react/jsx-key */
    return [
      <div className="cursor-pointer text-bold" onClick={() => onNavigateToDeployment(item)}>
        {item.name}
      </div>,
      <div className="flex">
        <NodeStatusIndicator className="mr-2" status={item.nodeStatus} />
        {item.nodeName}
      </div>,
      <div>{item.prefix}</div>,
      <DeploymentStatusTag className="w-fit m-auto" status={item.status} />,
      <div>{item.date}</div>,
      mutable ? (
        <Image
          src="/deploy.svg"
          alt={t('common:deploy')}
          className={item.nodeStatus === 'running' ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'}
          onClick={() => item.nodeStatus === 'running' && onDeploy(item)}
          width={24}
          height={24}
        />
      ) : null,
    ]
    /* eslint-enable react/jsx-key */
  }

  return filters.items.length ? (
    <>
      <DyoCard className="p-8 mt-4 flex">
        <DyoInput
          className="basis-4/5 mr-4"
          grow
          placeholder={t('common:search')}
          onChange={e =>
            filters.setFilter({
              text: e.target.value,
            })
          }
        />
        <DyoSelect
          className="basis-1/5 ml-4"
          placeholder="Status"
          value={filters.filter.enum ?? 'default'}
          onChange={e => {
            filters.setFilter({
              enum: e.target.value === 'default' ? undefined : (e.target.value as DeploymentStatus),
            })
          }}
        >
          <option value="default">{t('common:all')}</option>
          {DEPLOYMENT_STATUS_VALUES.map(it => (
            <option key={it} value={it}>
              {t(`common:deploymentStatuses.${it}`)}
            </option>
          ))}
        </DyoSelect>
      </DyoCard>
      <DyoCard className="mt-4">
        <DyoList
          headerClassName={headerClasses}
          headers={headers}
          itemClassName="h-11 min-h-min text-light-eased pl-4 w-fit"
          noSeparator
          data={filters.filtered}
          itemBuilder={itemTemplate}
        />
      </DyoCard>
    </>
  ) : (
    <DyoHeading element="h3" className="text-md text-center text-light-eased pt-32">
      {t('noDeployments')}
    </DyoHeading>
  )
}

export default VersionDeploymentsSection
