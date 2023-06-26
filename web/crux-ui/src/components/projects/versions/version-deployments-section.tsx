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
import { EnumFilter, enumFilterFor, TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
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
  StartDeployment,
  VersionDetails,
  WS_TYPE_NODE_EVENT,
} from '@app/models'
import { deploymentApiUrl, deploymentDeployUrl, deploymentStartApiUrl, deploymentUrl, WS_NODES } from '@app/routes'
import { sendForm, utcDateToLocale } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { NextRouter, useRouter } from 'next/dist/client/router'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import DeploymentStatusTag from './deployments/deployment-status-tag'
import { VersionActions } from './use-version-state'

export const startDeployment = async (
  router: NextRouter,
  onApiError: (response: Response) => void,
  deploymentId: string,
  deployInstances?: string[],
) => {
  const res = await sendForm(
    'POST',
    deploymentStartApiUrl(deploymentId),
    deployInstances
      ? ({
          instances: deployInstances,
        } as StartDeployment)
      : null,
  )

  if (!res.ok) {
    onApiError(res)
    return null
  }

  await router.push(deploymentDeployUrl(deploymentId))

  return null
}

interface VersionDeploymentsSectionProps {
  version: VersionDetails
  actions: VersionActions
}

type DeploymentFilter = TextFilter & EnumFilter<DeploymentStatus>

const VersionDeploymentsSection = (props: VersionDeploymentsSectionProps) => {
  const { version, actions } = props

  const { t } = useTranslation('versions')

  const router = useRouter()

  const handleApiError = defaultApiErrorHandler(t)

  const [showInfo, setShowInfo] = useState<DeploymentByVersion>(null)
  const [confirmModalConfig, confirm] = useConfirmation()

  const onDeploy = async (deployment: DeploymentByVersion) => {
    const confirmed = await confirm(null, {
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

    await startDeployment(router, handleApiError, deployment.id)
  }

  const onDeleteDeployment = async (deployment: DeploymentByVersion) => {
    const confirmed = await confirm(null, {
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

    const res = await fetch(deploymentApiUrl(deployment.id), { method: 'DELETE' })
    if (!res.ok) {
      handleApiError(res)
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

  useEffect(() => filters.setItems(version.deployments), [filters, version.deployments])

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
      <div className="flex justify-center">
        <Link className="mr-2 inline-block cursor-pointer" href={deploymentUrl(item.id)} passHref>
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
          <Image
            src="/copy.svg"
            alt={t('common:copy')}
            width={24}
            height={24}
            className={deploymentIsCopiable(item.status) ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'}
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
              itemClassName={itemClasses}
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

      <DyoConfirmationModal config={confirmModalConfig} />
    </>
  )
}

export default VersionDeploymentsSection
