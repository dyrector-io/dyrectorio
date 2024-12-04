import DeploymentStatusTag, { deploymentStatusTranslation } from '@app/components/deployments/deployment-status-tag'
import Filters from '@app/components/shared/filters'
import { DyoCard } from '@app/elements/dyo-card'
import { chipsQALabelFromValue } from '@app/elements/dyo-chips'
import DyoFilterChips from '@app/elements/dyo-filter-chips'
import DyoIcon from '@app/elements/dyo-icon'
import DyoLink from '@app/elements/dyo-link'
import DyoModal from '@app/elements/dyo-modal'
import DyoTable, { DyoColumn, sortDate, sortEnum, sortString } from '@app/elements/dyo-table'
import { defaultApiErrorHandler } from '@app/errors'
import usePagination from '@app/hooks/use-pagination'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { useThrottling } from '@app/hooks/use-throttleing'
import {
  DEPLOYMENT_STATUS_VALUES,
  Deployment,
  DeploymentQuery,
  DeploymentStatus,
  PaginatedList,
  PaginationQuery,
} from '@app/models'
import { auditToLocaleDate } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { QA_MODAL_LABEL_DEPLOYMENT_NOTE } from 'quality-assurance'
import { useCallback, useEffect, useState } from 'react'
import { PaginationSettings } from '../shared/paginator'

const defaultPagination: PaginationSettings = { pageNumber: 0, pageSize: 10 }

interface NodeDeploymentListProps {
  nodeId: string
}

type FilterState = {
  filter: string
  status: DeploymentStatus | null
}

const NodeDeploymentList = (props: NodeDeploymentListProps) => {
  const { nodeId: propsNodeId } = props

  const { t } = useTranslation('deployments')
  const routes = useTeamRoutes()
  const router = useRouter()

  const handleApiError = defaultApiErrorHandler(t)

  const [showInfo, setShowInfo] = useState<Deployment>(null)

  const [filter, setFilter] = useState<FilterState>({
    filter: '',
    status: null,
  })

  const throttle = useThrottling(1000)

  const onRowClick = async (data: Deployment) => await router.push(routes.deployment.details(data.id))

  const fetchData = useCallback(
    async (paginationQuery: PaginationQuery): Promise<PaginatedList<Deployment>> => {
      const { filter: keywordFilter, status } = filter

      const query: DeploymentQuery = {
        ...paginationQuery,
        filter: !keywordFilter || keywordFilter.trim() === '' ? null : keywordFilter,
        status,
      }

      const res = await fetch(routes.node.api.deployments(propsNodeId, query))

      if (!res.ok) {
        await handleApiError(res)
        return null
      }

      return (await res.json()) as PaginatedList<Deployment>
    },
    [routes, handleApiError, filter],
  )

  const [pagination, setPagination, refreshPage] = usePagination(
    {
      defaultSettings: defaultPagination,
      fetchData,
    },
    [filter],
  )

  useEffect(() => {
    throttle(refreshPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  return (
    <>
      <Filters setTextFilter={it => setFilter({ ...filter, filter: it })}>
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
      </Filters>

      <DyoCard className="relative mt-4">
        <DyoTable
          data={pagination.data ?? []}
          dataKey="id"
          onRowClick={onRowClick}
          paginationTotal={pagination.total}
          onServerPagination={setPagination}
          initialSortColumn={3}
          initialSortDirection="desc"
        >
          <DyoColumn
            header={t('common:project')}
            body={(it: Deployment) => it.project.name}
            className="w-3/12"
            sortable
            sortField="project.name"
            sort={sortString}
          />
          <DyoColumn
            header={t('common:version')}
            body={(it: Deployment) => it.version.name}
            className="w-1/12"
            sortable
            sortField="version.name"
            sort={sortString}
          />
          <DyoColumn
            header={t('common:prefix')}
            field="prefix"
            className="w-2/12"
            sortable
            sortField="prefix"
            sort={sortString}
          />
          <DyoColumn
            header={t('common:updatedAt')}
            body={(it: Deployment) => auditToLocaleDate(it.audit)}
            className="w-2/12"
            suppressHydrationWarning
            sortable
            sortField={it => it.audit.updatedAt ?? it.audit.createdAt}
            sort={sortDate}
          />
          <DyoColumn
            header={t('common:status')}
            body={(it: Deployment) => <DeploymentStatusTag status={it.status} className="w-fit mx-auto" />}
            className="text-center"
            sortable
            sortField="status"
            sort={sortEnum(DEPLOYMENT_STATUS_VALUES)}
          />
          <DyoColumn
            header={t('common:actions')}
            className="w-40 text-center"
            preventClickThrough
            body={(it: Deployment) => (
              <>
                <div className="inline-block mr-2">
                  <DyoLink href={routes.deployment.details(it.id)} qaLabel="deployment-list-view-icon">
                    <DyoIcon src="/eye.svg" alt={t('common:view')} size="md" />
                  </DyoLink>
                </div>

                <DyoIcon
                  src="/note.svg"
                  alt={t('common:note')}
                  size="md"
                  className={!!it.note && it.note.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'}
                  onClick={() => !!it.note && it.note.length > 0 && setShowInfo(it)}
                />
              </>
            )}
          />
        </DyoTable>
      </DyoCard>

      {showInfo && (
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
    </>
  )
}

export default NodeDeploymentList
