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
  deploymentIsCopiable,
  deploymentIsDeployable,
  DeploymentStatus,
  DEPLOYMENT_STATUS_VALUES,
  NodeEventMessage,
  NodeStatus,
  VersionDetails,
  WS_TYPE_NODE_EVENT,
} from '@app/models'
import { deploymentDeployUrl, deploymentStartApiUrl, deploymentUrl, WS_NODES } from '@app/routes'
import { utcDateToLocale } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { NextRouter, useRouter } from 'next/dist/client/router'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import DeploymentStatusTag from './deployments/deployment-status-tag'
import useCopyDeploymentModal from './deployments/use-copy-deployment-confirmation-modal'

export const startDeployment = async (
  router: NextRouter,
  onApiError: (response: Response) => void,
  deploymentId: string,
) => {
  const res = await fetch(deploymentStartApiUrl(deploymentId), {
    method: 'POST',
  })

  if (!res.ok) {
    onApiError(res)
    return null
  }

  await router.push(deploymentDeployUrl(deploymentId))

  return null
}

interface VersionDeploymentsSectionProps {
  version: VersionDetails
}

type DeploymentFilter = TextFilter & EnumFilter<DeploymentStatus>

const VersionDeploymentsSection = (props: VersionDeploymentsSectionProps) => {
  const { version } = props

  const { t } = useTranslation('versions')

  const router = useRouter()

  const handleApiError = defaultApiErrorHandler(t)

  const [confirmationModal, copyDeployment] = useCopyDeploymentModal(handleApiError)

  const [showInfo, setShowInfo] = useState<DeploymentByVersion>(null)

  const onDeploy = (deploymentId: string) => startDeployment(router, handleApiError, deploymentId)

  const onCopyDeployment = async (deploymentId: string) => {
    const url = await copyDeployment({
      deploymentId,
    })

    if (!url) {
      return
    }

    await router.push(url)
  }

  const filters = useFilters<DeploymentByVersion, DeploymentFilter>({
    filters: [
      textFilterFor<DeploymentByVersion>(it => [it.node.name, it.prefix, it.updatedAt]),
      enumFilterFor<DeploymentByVersion, DeploymentStatus>(it => [it.status]),
    ],
    initialData: version.deployments,
  })

  const [nodeStatuses, setNodeStatuses] = useState<Record<string, NodeStatus>>({})

  const nodeSock = useWebSocket(WS_NODES)

  nodeSock.on(WS_TYPE_NODE_EVENT, (message: NodeEventMessage) => {
    const statuses = {
      ...nodeStatuses,
    }

    statuses[message.id] = message.status

    setNodeStatuses(statuses)
  })

  const headers = [
    ...['common:node', 'common:prefix', 'common:status', 'common:date', 'common:actions'].map(it => t(it)),
  ]
  const defaultHeaderClass = 'h-11 uppercase text-bright text-sm bg-medium-eased py-2 font-semibold'
  const headerClasses = [
    clsx('rounded-tl-lg pl-6', defaultHeaderClass),
    defaultHeaderClass,
    clsx('text-center', defaultHeaderClass),
    defaultHeaderClass,
    clsx('rounded-tr-lg text-right pr-6', defaultHeaderClass),
  ]

  const itemTemplate = (item: DeploymentByVersion) => {
    const deployable = deploymentIsDeployable(item.status, version.type)

    /* eslint-disable react/jsx-key */
    return [
      <Link className="flex place-items-center cursor-pointer" href={deploymentUrl(item.id)} passHref>
        <NodeStatusIndicator className="mr-2" status={item.node.status} />
        {item.node.name}
      </Link>,
      item.prefix,
      <DeploymentStatusTag className="w-fit m-auto" status={item.status} />,
      <>{utcDateToLocale(item.updatedAt)}</>,
      <div className="flex flex-row">
        <Link className="mr-2 inline-block cursor-pointer" href={deploymentUrl(item.id)} passHref>
          <Image src="/eye.svg" alt={t('common:deploy')} width={24} height={24} />
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
              onClick={() => item.node.status === 'connected' && onDeploy(item.id)}
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
          className={
            deploymentIsCopiable(item.status, version.type) ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'
          }
          onClick={() => deploymentIsCopiable(item.status, version.type) && onCopyDeployment(item.id)}
        />
      </div>,
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
