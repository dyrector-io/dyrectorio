import { WS_NODES } from '@app/const'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoList } from '@app/elements/dyo-list'
import { TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import useWebSocket from '@app/hooks/use-websocket'
import {
  DeploymentByVersion,
  GetNodeStatusListMessage,
  NodeStatus,
  NodeStatusMessage,
  ProductDetails,
  VersionDetails,
  WS_TYPE_GET_NODE_STATUS_LIST,
  WS_TYPE_NODE_STATUS,
  WS_TYPE_NODE_STATUSES,
} from '@app/models'
import { deploymentUrl } from '@app/routes'
import { distinct } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import Image from 'next/image'
import { useState } from 'react'
import DeploymentStatusIndicator from './deployments/deployment-status-indicator'
import DeploymentStatusTag from './deployments/deployment-status-tag'

interface VersionDeploymentsSectionProps {
  product: ProductDetails
  version: VersionDetails
}

const VersionDeploymentsSection = (props: VersionDeploymentsSectionProps) => {
  const { product, version } = props

  const { t } = useTranslation('versions')

  const router = useRouter()

  const filters = useFilters<DeploymentByVersion, TextFilter>({
    filters: [textFilterFor<DeploymentByVersion>(it => [it.name, it.nodeName, it.prefix, it.status, it.date])],
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

  const itemTemplate = (deployment: DeploymentByVersion) => /* eslint-disable react/jsx-key */ [
    <DeploymentStatusIndicator status={deployment.status} />,
    <div className="cursor-pointer text-bold" onClick={() => onNavigateToDeployment(deployment)}>
      {deployment.name}
    </div>,
    <div>{deployment.nodeName}</div>,
    <div>{deployment.date}</div>,
    <div>{deployment.prefix}</div>,
    <DeploymentStatusTag className="w-fit m-auto" status={deployment.status} />,
    <Image src="/deploy.svg" alt={t('common:deploy')} width={24} height={24} />,
  ]
  /* eslint-enable react/jsx-key */

  return filters.items.length ? (
    <DyoCard className="p-8 mt-4">
      <DyoInput
        className="w-2/3 mb-6"
        placeholder={t('common:search')}
        onChange={e =>
          filters.setFilter({
            text: e.target.value,
          })
        }
      />

      <DyoList
        headers={[
          '',
          ...['deploymentName', 'common:node', 'common:date', 'common:prefix', 'common:status'].map(it => t(it)),
          '',
        ]}
        data={filters.filtered}
        itemBuilder={it => itemTemplate(it)}
      />
    </DyoCard>
  ) : (
    <DyoHeading element="h3" className="text-md text-center text-light-eased pt-32">
      {t('noDeployments')}
    </DyoHeading>
  )
}

export default VersionDeploymentsSection
