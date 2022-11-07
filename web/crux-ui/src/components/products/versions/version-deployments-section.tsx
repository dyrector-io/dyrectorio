import NodeStatusIndicator from '@app/components/nodes/node-status-indicator'
import Filters from '@app/components/shared/filters'
import { DyoCard } from '@app/elements/dyo-card'
import DyoFilterChips from '@app/elements/dyo-filter-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoList } from '@app/elements/dyo-list'
import DyoModal, { DyoConfirmationModal } from '@app/elements/dyo-modal'
import { defaultApiErrorHandler } from '@app/errors'
import { EnumFilter, enumFilterFor, TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import useWebSocket from '@app/hooks/use-websocket'
import {
  DeploymentByVersion,
  deploymentIsCopyable,
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
import { deploymentDeployUrl, deploymentStartUrl, deploymentUrl, WS_NODES } from '@app/routes'
import { distinct, utcDateToLocale } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { NextRouter, useRouter } from 'next/dist/client/router'
import Image from 'next/image'
import { useState } from 'react'
import toast from 'react-hot-toast'
import DeploymentStatusTag from './deployments/deployment-status-tag'
import useCopyDeploymentModal from './deployments/use-copy-deployment-confirmation-modal'

export const startDeployment = async (
  router: NextRouter,
  productId: string,
  versionId: string,
  deploymentId: string,
) => {
  const res = await fetch(deploymentStartUrl(productId, versionId, deploymentId), {
    method: 'POST',
  })

  if (res.status === 412) {
    const json = await res.json()
    toast.error(json.description)
    return
  }

  if (!res.ok) {
    return
  }

  router.push(deploymentDeployUrl(productId, versionId, deploymentId))
}

interface VersionDeploymentsSectionProps {
  product: ProductDetails
  version: VersionDetails
}

type DeploymentFilter = TextFilter & EnumFilter<DeploymentStatus>

const VersionDeploymentsSection = (props: VersionDeploymentsSectionProps) => {
  const { version, product } = props

  const { t } = useTranslation('versions')

  const router = useRouter()

  const handleApiError = defaultApiErrorHandler(t)

  const [confirmationModal, copyDeployment] = useCopyDeploymentModal(handleApiError)

  const [showInfo, setShowInfo] = useState<DeploymentByVersion>(null)

  const filters = useFilters<DeploymentByVersion, DeploymentFilter>({
    filters: [
      textFilterFor<DeploymentByVersion>(it => [it.nodeName, it.prefix, it.date]),
      enumFilterFor<DeploymentByVersion, DeploymentStatus>(it => [it.status]),
    ],
    initialData: version.deployments,
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

  const onDeploy = (deployment: DeploymentByVersion) => startDeployment(router, product.id, version.id, deployment.id)

  const onCopyDeployment = async (deployment: DeploymentByVersion) => {
    const url = await copyDeployment({
      productId: product.id,
      versionId: version.id,
      deploymentId: deployment.id,
    })

    if (!url) {
      return
    }

    router.push(url)
  }

  const headers = [
    ...['common:node', 'common:prefix', 'common:status', 'common:date', 'common:actions'].map(it => t(it)),
  ]
  const defaultHeaderClass = 'h-11 uppercase text-bright text-sm bg-medium-eased py-3 pl-4 font-semibold'
  const headerClasses = [
    clsx('rounded-tl-lg', defaultHeaderClass),
    defaultHeaderClass,
    clsx('text-center', defaultHeaderClass),
    defaultHeaderClass,
    clsx('rounded-tr-lg', defaultHeaderClass),
  ]

  const itemTemplate = (item: DeploymentByVersion) => {
    const mutable = deploymentIsMutable(item.status)

    /* eslint-disable react/jsx-key */
    return [
      <div className="flex cursor-pointer" onClick={() => onNavigateToDeployment(item)}>
        <NodeStatusIndicator className="mr-2 place-items-center" status={item.nodeStatus} />
        {item.nodeName}
      </div>,
      <div>{item.prefix}</div>,
      <DeploymentStatusTag className="w-fit m-auto" status={item.status} />,
      <div>{utcDateToLocale(item.date)}</div>,
      <>
        <div className="mr-2 inline-block">
          <Image
            src="/eye.svg"
            alt={t('common:deploy')}
            width={24}
            height={24}
            className="cursor-pointer"
            onClick={() => onNavigateToDeployment(item)}
          />
        </div>
        {mutable && (
          <div className="mr-2 inline-block">
            <Image
              src="/deploy.svg"
              alt={t('common:deploy')}
              className={item.nodeStatus === 'running' ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'}
              onClick={() => item.nodeStatus === 'running' && onDeploy(item)}
              width={24}
              height={24}
            />
          </div>
        )}
        <div className="mr-2 inline-block">
          <Image
            src="/note.svg"
            alt={t('common:deploy')}
            width={24}
            height={24}
            className={!!item.note && item.note.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'}
            onClick={() => !!item.note && item.note.length > 0 && setShowInfo(item)}
          />
        </div>
        <Image
          src="/copy.svg"
          alt={t('common:copy')}
          width={24}
          height={24}
          className={deploymentIsCopyable(item.status) ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'}
          onClick={() => deploymentIsCopyable(item.status) && onCopyDeployment(item)}
        />
      </>,
    ]
    /* eslint-enable react/jsx-key */
  }

  return (
    <>
      {filters.items.length ? (
        <>
          <Filters setTextFilter={it => filters.setFilter({ text: it })}>
            <DyoFilterChips
              className="pl-6"
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

      <DyoConfirmationModal config={confirmationModal} className="w-1/4" confirmColor="bg-error-red" />
    </>
  )
}

export default VersionDeploymentsSection
