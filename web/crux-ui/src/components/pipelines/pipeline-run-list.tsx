import { DyoCard } from '@app/elements/dyo-card'
import DyoTable, { DyoColumn } from '@app/elements/dyo-table'
import LoadingIndicator from '@app/elements/loading-indicator'
import { defaultApiErrorHandler } from '@app/errors'
import usePagination from '@app/hooks/use-pagination'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { PaginatedList, PaginationQuery, PipelineRun } from '@app/models'
import { utcDateToLocale } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import { useCallback, useEffect } from 'react'
import { PaginationSettings } from '../shared/paginator'
import PipelineRunStatusTag from './pipeline-run-status-tag'
import { PipelineDetailsDispatch, PipelineDetailsState, setRuns } from './use-pipeline-state'

const defaultPagination: PaginationSettings = { pageNumber: 0, pageSize: 20 }

type PipelineRunListProps = {
  state: PipelineDetailsState
  dispatch: PipelineDetailsDispatch
}

const PipelineRunList = (props: PipelineRunListProps) => {
  const { state, dispatch } = props
  const { pipeline, runs } = state

  const { t } = useTranslation('pipelines')

  const routes = useTeamRoutes()

  const handleApiError = defaultApiErrorHandler(t)

  const fetchData = useCallback(
    async (query: PaginationQuery): Promise<PaginatedList<PipelineRun>> => {
      const res = await fetch(routes.pipeline.api.runs(pipeline.id, query))

      if (!res.ok) {
        await handleApiError(res)
        return null
      }

      return (await res.json()) as PaginatedList<PipelineRun>
    },
    [routes, pipeline, handleApiError],
  )

  const [pagination, setPagination] = usePagination({
    defaultSettings: defaultPagination,
    fetchData,
  })

  const { data: fetchedRuns, total } = pagination

  useEffect(() => {
    if (fetchedRuns) {
      dispatch(setRuns(fetchedRuns))
    }
  }, [fetchedRuns, dispatch])

  return !runs ? (
    <LoadingIndicator className="m-auto" />
  ) : runs.length < 1 ? (
    <span className="text-bright m-auto">{t('noRuns')}</span>
  ) : (
    <DyoCard className="mt-4">
      <DyoTable data={runs} dataKey="id" pagination="server" paginationTotal={total} onServerPagination={setPagination}>
        <DyoColumn
          header={t('common:status')}
          className="w-2/12 text-center"
          body={(it: PipelineRun) => <PipelineRunStatusTag status={it.status} className="w-fit mx-auto" />}
        />

        <DyoColumn
          header={t('triggeredBy')}
          className="w-2/12 text-center"
          body={(it: PipelineRun) => (
            <span className="font-semibold w-fit mx-auto">{it.startedBy?.name ?? t('common:event')}</span>
          )}
        />

        <DyoColumn
          header={t('common:createdAt')}
          className="w-2/12"
          suppressHydrationWarning
          body={(it: PipelineRun) => utcDateToLocale(it.startedAt)}
        />

        <DyoColumn
          header={t('finishedAt')}
          className="w-2/12"
          suppressHydrationWarning
          body={(it: PipelineRun) => (it.finishedAt ? utcDateToLocale(it.finishedAt) : null)}
        />
      </DyoTable>
    </DyoCard>
  )
}

export default PipelineRunList
