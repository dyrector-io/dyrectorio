import { PaginationSettings } from '@app/components/shared/paginator'
import { DyoCard } from '@app/elements/dyo-card'
import DyoChips, { chipsQALabelFromValue } from '@app/elements/dyo-chips'
import DyoDatePicker from '@app/elements/dyo-date-picker'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoIcon from '@app/elements/dyo-icon'
import DyoModal from '@app/elements/dyo-modal'
import DyoTable, { DyoColumn, sortDate, sortString } from '@app/elements/dyo-table'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { useThrottling } from '@app/hooks/use-throttleing'
import {
  DyoNode,
  NODE_EVENT_TYPE_VALUES,
  NodeAuditLog,
  NodeAuditLogList,
  NodeAuditLogQuery,
  NodeEventType,
} from '@app/models'
import { getEndOfToday, utcDateToLocale } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import { QA_MODAL_LABEL_NODE_AUDIT_DETAILS } from 'quality-assurance'
import { useEffect, useState } from 'react'
import JsonEditor from '../shared/json-editor'

type NodeAuditFilter = {
  from: Date
  to: Date
  eventType: NodeEventType
}

interface NodeAuditListProps {
  node: DyoNode
}

const sixDays = 1000 * 60 * 60 * 24 * 6 // ms * minutes * hours * day * six

const NodeAuditList = (props: NodeAuditListProps) => {
  const { node } = props

  const { t } = useTranslation('nodes')
  const routes = useTeamRoutes()
  const throttle = useThrottling(1000)

  const endOfToday = getEndOfToday()

  const [pagination, setPagination] = useState<PaginationSettings>({ pageSize: 10, pageNumber: 0 })
  const [total, setTotal] = useState<number>(0)
  const [data, setData] = useState<NodeAuditLog[]>([])
  const [filter, setFilter] = useState<NodeAuditFilter>({
    from: new Date(endOfToday.getTime() - sixDays),
    to: new Date(endOfToday),
    eventType: null,
  })
  const [showInfo, setShowInfo] = useState<NodeAuditLog>(null)

  const fetchData = async () => {
    const { from, to, eventType } = filter

    const query: NodeAuditLogQuery = {
      skip: pagination.pageNumber * pagination.pageSize,
      take: pagination.pageSize,
      from: (from ?? new Date(endOfToday.getTime() - sixDays)).toISOString(),
      to: (to ?? endOfToday).toISOString(),
      filterEventType: eventType,
    }
    const res = await fetch(routes.node.api.audit(node.id, query))

    if (res.ok) {
      const list = (await res.json()) as NodeAuditLogList
      setData(list.items)
      setTotal(list.total)
    } else {
      setData([])
    }
  }

  useEffect(() => {
    throttle(fetchData, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination, filter])

  const onShowInfoClick = (logEntry: NodeAuditLog) => setShowInfo(logEntry)

  const onDateRangedChanged = dates => {
    const [start, end] = dates
    if (end !== null) end.setHours(23, 59, 59, 999) // end of the day

    setFilter({ ...filter, from: start, to: end })
  }

  return (
    <>
      <DyoCard className="flex flex-col p-8">
        <DyoHeading element="h3" className="text-xl text-bright">
          {t('common:filters')}
        </DyoHeading>

        <div className="flex flex-row items-center mt-4">
          <DyoChips
            className="mr-4"
            name="nodeEventType"
            choices={['none', ...NODE_EVENT_TYPE_VALUES]}
            converter={it => t(`auditEvents.${it}`)}
            selection={filter.eventType ?? 'none'}
            onSelectionChange={it => setFilter({ ...filter, eventType: it === 'none' ? null : (it as NodeEventType) })}
            qaLabel={chipsQALabelFromValue}
          />

          <DyoDatePicker
            selectsRange
            startDate={filter.from}
            endDate={filter.to}
            onChange={onDateRangedChanged}
            shouldCloseOnSelect={false}
            maxDate={new Date()}
            isClearable
            className="w-1/4"
          />
        </div>
      </DyoCard>

      <DyoCard className="relative mt-4 overflow-auto">
        <DyoTable
          data={data}
          initialSortColumn={0}
          initialSortDirection="asc"
          pagination="server"
          paginationTotal={total}
          onServerPagination={setPagination}
        >
          <DyoColumn
            header={t('common:date')}
            className="w-2/12"
            suppressHydrationWarning
            body={(it: NodeAuditLog) => utcDateToLocale(it.createdAt)}
            sortable
            sortField="createdAt"
            sort={sortDate}
          />
          <DyoColumn
            header={t('common:event')}
            className="w-48"
            body={(it: NodeAuditLog) => t(`auditEvents.${it.event}`)}
            sortable
            sortField="event"
            sort={sortString}
          />
          <DyoColumn
            header={t('common:data')}
            body={(it: NodeAuditLog) => (
              <div className="cursor-pointer max-w-4xl truncate" onClick={() => onShowInfoClick(it)}>
                {it.data && JSON.stringify(it.data)}
              </div>
            )}
          />
          <DyoColumn
            header={t('common:actions')}
            className="w-24 text-center"
            body={(it: NodeAuditLog) =>
              it.data ? (
                <DyoIcon
                  className="aspect-square cursor-pointer ml-auto mr-auto"
                  src="/eye.svg"
                  alt={t('common:view')}
                  size="md"
                  onClick={() => onShowInfoClick(it)}
                />
              ) : null
            }
          />
        </DyoTable>
      </DyoCard>
      {!showInfo ? null : (
        <DyoModal
          className="w-1/2 h-1/2"
          titleClassName="pl-4 font-medium text-xl text-bright mb-3"
          title={`${t(`auditEvents.${showInfo.event}`)} | ${utcDateToLocale(showInfo.createdAt)}`}
          open={!!showInfo}
          onClose={() => setShowInfo(null)}
          qaLabel={QA_MODAL_LABEL_NODE_AUDIT_DETAILS}
        >
          <JsonEditor className="overflow-y-auto p-4 h-full" disabled value={showInfo.data} />
        </DyoModal>
      )}
    </>
  )
}

export default NodeAuditList
