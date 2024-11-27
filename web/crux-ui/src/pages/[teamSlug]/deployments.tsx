import AddDeploymentCard from '@app/components/deployments/add-deployment-card'
import CopyDeploymentCard from '@app/components/deployments/copy-deployment-card'
import DeploymentStatusTag, { deploymentStatusTranslation } from '@app/components/deployments/deployment-status-tag'
import useCopyDeploymentState from '@app/components/deployments/use-copy-deployment-state'
import { Layout } from '@app/components/layout'
import SelectNodeChips from '@app/components/nodes/select-node-chips'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import PageHeading from '@app/components/shared/page-heading'
import { PaginationSettings } from '@app/components/shared/paginator'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { chipsQALabelFromValue } from '@app/elements/dyo-chips'
import DyoFilterChips from '@app/elements/dyo-filter-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoIcon from '@app/elements/dyo-icon'
import { DyoInput } from '@app/elements/dyo-input'
import DyoLink from '@app/elements/dyo-link'
import DyoModal, { DyoConfirmationModal } from '@app/elements/dyo-modal'
import DyoTable, { DyoColumn, sortDate, sortEnum, sortString } from '@app/elements/dyo-table'
import { defaultApiErrorHandler } from '@app/errors'
import useConfirmation from '@app/hooks/use-confirmation'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { useThrottling } from '@app/hooks/use-throttleing'
import {
  DEPLOYMENT_STATUS_VALUES,
  Deployment,
  DeploymentList,
  DeploymentQuery,
  DeploymentStatus,
  DyoNode,
  deploymentIsCopiable,
  deploymentIsDeletable,
} from '@app/models'
import { auditToLocaleDate } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { QA_DIALOG_LABEL_DELETE_DEPLOYMENT, QA_MODAL_LABEL_DEPLOYMENT_NOTE } from 'quality-assurance'
import { useEffect, useState } from 'react'

const defaultPagination: PaginationSettings = { pageNumber: 0, pageSize: 10 }

type FilterState = {
  filter: string
  status: DeploymentStatus | null
}

const DeploymentsPage = () => {
  const { t } = useTranslation('deployments')
  const routes = useTeamRoutes()
  const router = useRouter()

  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [total, setTotal] = useState<number>(0)
  const [filter, setFilter] = useState<FilterState>({
    filter: '',
    status: null,
  })
  const [filterNode, setFilterNode] = useState<DyoNode | null>(null)

  const [pagination, setPagination] = useState<PaginationSettings>(defaultPagination)

  const [creating, setCreating] = useState(false)

  const handleApiError = defaultApiErrorHandler(t)

  const [showInfo, setShowInfo] = useState<Deployment>(null)
  const [copyDeploymentTarget, setCopyDeploymentTarget] = useCopyDeploymentState({
    handleApiError,
  })
  const [confirmModalConfig, confirm] = useConfirmation()

  const throttle = useThrottling(1000)

  const fetchData = async () => {
    const { status } = filter

    const query: DeploymentQuery = {
      skip: pagination.pageNumber * pagination.pageSize,
      take: pagination.pageSize,
      filter: !filter.filter || filter.filter.trim() === '' ? null : filter.filter,
      nodeId: filterNode?.id ?? null,
      status: status,
    }

    const res = await fetch(routes.deployment.api.list(query))

    if (res.ok) {
      const list = (await res.json()) as DeploymentList
      setDeployments(list.items)
      setTotal(list.total)
    } else {
      setDeployments([])
    }
  }

  useEffect(() => {
    throttle(fetchData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, filterNode])

  useEffect(() => {
    throttle(fetchData, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination])

  const selfLink: BreadcrumbLink = {
    name: t('common:deployments'),
    url: routes.deployment.list(),
  }

  const onDeleteDeployment = async (deployment: Deployment) => {
    const confirmed = await confirm({
      qaLabel: QA_DIALOG_LABEL_DELETE_DEPLOYMENT,
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

    setDeployments([...deployments.filter(it => it.id !== deployment.id)])
  }

  const onDeploymentCopied = async (deploymentId: string) => {
    await router.push(routes.deployment.details(deploymentId))
  }

  const onRowClick = async (data: Deployment) => await router.push(routes.deployment.details(data.id))

  const onDeploymentCreated = async (deploymentId: string) => await router.push(routes.deployment.details(deploymentId))

  const onCreateDiscard = () => setCreating(false)

  return (
    <Layout title={t('common:deployments')}>
      <PageHeading pageLink={selfLink}>
        {!creating && (
          <DyoButton className="ml-auto px-4" onClick={() => setCreating(true)}>
            {t('common:add')}
          </DyoButton>
        )}
      </PageHeading>

      {creating && <AddDeploymentCard className="mb-4 p-8" onAdd={onDeploymentCreated} onDiscard={onCreateDiscard} />}

      {!copyDeploymentTarget ? null : (
        <CopyDeploymentCard
          className="p-8 mb-4"
          deployment={copyDeploymentTarget}
          onDeplyomentCopied={onDeploymentCopied}
          onDiscard={() => setCopyDeploymentTarget(null)}
        />
      )}

      <DyoCard className="flex flex-row p-8">
        <div className="w-6/12 flex-col">
          <DyoHeading element="h3" className="text-xl text-bright">
            {t('common:filters')}
          </DyoHeading>

          <div className="flex flex-row mt-4">
            <DyoInput
              className="grow"
              placeholder={t('common:search')}
              onChange={e => setFilter({ ...filter, filter: e.target.value })}
              grow
            />

            <DyoFilterChips
              className="pl-6"
              name="deploymentStatusFilter"
              choices={DEPLOYMENT_STATUS_VALUES}
              converter={it => t(deploymentStatusTranslation(it))}
              selection={filter.status}
              onSelectionChange={type => {
                setFilter({
                  ...filter,
                  status: type === 'all' ? null : (type as DeploymentStatus),
                })
              }}
              qaLabel={chipsQALabelFromValue}
            />
          </div>
        </div>

        <div className="w-6/12 flex-col">
          <DyoHeading element="h3" className="text-xl text-bright">
            {t('common:nodes')}
          </DyoHeading>

          <SelectNodeChips
            className="mt-4"
            name="nodes"
            allowNull
            onSelectionChange={async it => setFilterNode(it)}
            selection={filterNode}
          />
        </div>
      </DyoCard>

      <DyoCard className="relative mt-4">
        <DyoTable
          data={deployments}
          dataKey="id"
          pagination="server"
          paginationTotal={total}
          onServerPagination={setPagination}
          onRowClick={onRowClick}
          initialSortColumn={4}
          initialSortDirection="desc"
        >
          <DyoColumn header={t('common:project')} field="project.name" className="w-2/12" sortable sort={sortString} />
          <DyoColumn header={t('common:version')} field="version.name" className="w-2/12" sortable sort={sortString} />
          <DyoColumn header={t('common:node')} field="node.name" className="w-2/12" sortable sort={sortString} />
          <DyoColumn header={t('common:prefix')} field="prefix" className="w-2/12" sortable sort={sortString} />
          <DyoColumn
            header={t('common:updatedAt')}
            className="w-2/12"
            suppressHydrationWarning
            sortable
            sortField={(it: Deployment) => it.audit.updatedAt ?? it.audit.createdAt}
            sort={sortDate}
            body={(it: Deployment) => auditToLocaleDate(it.audit)}
          />
          <DyoColumn
            header={t('common:status')}
            className="w-2/12 text-center"
            sortable
            sortField="status"
            sort={sortEnum(DEPLOYMENT_STATUS_VALUES)}
            body={(it: Deployment) => <DeploymentStatusTag status={it.status} className="w-fit mx-auto" />}
          />
          <DyoColumn
            header={t('common:actions')}
            className="w-40 text-center"
            preventClickThrough
            body={(it: Deployment) => (
              <>
                <DyoLink
                  className="inline-block mr-2"
                  href={routes.deployment.details(it.id)}
                  qaLabel="deployment-list-view-icon"
                >
                  <DyoIcon src="/eye.svg" alt={t('common:view')} size="md" />
                </DyoLink>

                <DyoIcon
                  src="/note.svg"
                  alt={t('common:note')}
                  size="md"
                  className={clsx(
                    !!it.note && it.note.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-30',
                    'mr-2',
                  )}
                  onClick={() => !!it.note && it.note.length > 0 && setShowInfo(it)}
                />

                <DyoIcon
                  src="/copy.svg"
                  alt={t('common:copy')}
                  size="md"
                  className={clsx(
                    deploymentIsCopiable(it.status) ? 'cursor-pointer' : 'cursor-not-allowed opacity-30',
                    'mr-2',
                  )}
                  onClick={() => deploymentIsCopiable(it.status) && setCopyDeploymentTarget(it.id)}
                />

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

      {!showInfo ? null : (
        <DyoModal
          className="w-1/2 h-1/2"
          titleClassName="pl-4 font-medium text-xl text-bright mb-3"
          title={t('common:note')}
          open={!!showInfo}
          onClose={() => setShowInfo(null)}
          qaLabel={QA_MODAL_LABEL_DEPLOYMENT_NOTE}
        >
          <p className="text-bright mt-8 break-all overflow-y-auto">{showInfo.note}</p>
        </DyoModal>
      )}

      <DyoConfirmationModal config={confirmModalConfig} />
    </Layout>
  )
}

export default DeploymentsPage
