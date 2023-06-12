import Paginator, { PaginationSettings } from '@app/components/shared/paginator'
import { DyoCard } from '@app/elements/dyo-card'
import DyoChips from '@app/elements/dyo-chips'
import DyoDatePicker from '@app/elements/dyo-date-picker'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoList } from '@app/elements/dyo-list'
import DyoModal from '@app/elements/dyo-modal'
import { useThrottling } from '@app/hooks/use-throttleing'
import {
  DyoNode,
  NodeAuditLog,
  NodeAuditLogList,
  NodeAuditLogQuery,
  NodeEventType,
  NODE_EVENT_TYPE_VALUES,
} from '@app/models'
import { nodeAuditApiUrl } from '@app/routes'
import { getEndOfToday, utcDateToLocale } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
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

const defaultHeaderClass = 'uppercase text-bright text-sm font-semibold bg-medium-eased pl-2 py-3 h-11'
const columnWidths = ['w-2/12', 'w-48', '', 'w-24']
const sixDays = 1000 * 60 * 60 * 24 * 6 // ms * minutes * hours * day * six
const defaultPagination: PaginationSettings = { pageNumber: 0, pageSize: 10 }

const NodeAuditList = (props: NodeAuditListProps) => {
  const { node } = props

  const { t } = useTranslation('nodes')

  const endOfToday = getEndOfToday()

  const [total, setTotal] = useState(0)
  const [data, setData] = useState<NodeAuditLog[]>([])
  const [filter, setFilter] = useState<NodeAuditFilter>({
    from: new Date(endOfToday.getTime() - sixDays),
    to: new Date(endOfToday),
    eventType: null,
  })
  const [pagination, setPagination] = useState<PaginationSettings>(defaultPagination)
  const throttle = useThrottling(1000)

  const fetchData = async () => {
    const { from, to } = filter

    const query: NodeAuditLogQuery = {
      skip: pagination.pageNumber * pagination.pageSize,
      take: pagination.pageSize,
      from: (from ?? new Date(endOfToday.getTime() - sixDays)).toISOString(),
      to: (to ?? endOfToday).toISOString(),
      filterEventType: filter.eventType,
    }
    const res = await fetch(nodeAuditApiUrl(node.id, query))

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

  const [showInfo, setShowInfo] = useState<NodeAuditLog>(null)
  const onShowInfoClick = (logEntry: NodeAuditLog) => setShowInfo(logEntry)

  const onDateRangedChanged = dates => {
    const [start, end] = dates
    if (end !== null) end.setHours(23, 59, 59, 999) // end of the day

    setFilter({ ...filter, from: start, to: end })
  }

  const listHeaders = ['common:date', 'common:event', 'common:data', 'common:actions'].map(it => t(it))
  const headerClasses = [
    clsx('rounded-tl-lg pl-6', defaultHeaderClass),
    ...Array.from({ length: listHeaders.length - 2 }).map(() => defaultHeaderClass),
    clsx('rounded-tr-lg pr-6 text-center', defaultHeaderClass),
  ]

  const itemTemplate = (log: NodeAuditLog) => /* eslint-disable react/jsx-key */ [
    <div className="pl-4 min-w-max">{utcDateToLocale(log.createdAt)}</div>,
    t(`auditEvents.${log.event}`),
    <div className="cursor-pointer max-w-4xl truncate" onClick={() => onShowInfoClick(log)}>
      {log.data && JSON.stringify(log.data)}
    </div>,
    <div className="pr-4">
      {log.data && (
        <Image
          className="aspect-square cursor-pointer ml-auto mr-auto"
          src="/eye.svg"
          alt={t('common:view')}
          width={24}
          height={24}
          onClick={() => onShowInfoClick(log)}
        />
      )}
    </div>,
  ]
  /* eslint-enable react/jsx-key */

  return (
    <>
      <DyoCard className="flex flex-col p-8">
        <DyoHeading element="h3" className="text-xl text-bright">
          {t('common:filters')}
        </DyoHeading>

        <div className="flex flex-row items-center mt-4">
          <DyoChips
            className="mr-4"
            choices={['none', ...NODE_EVENT_TYPE_VALUES]}
            converter={it => t(`auditEvents.${it}`)}
            selection={filter.eventType ?? 'none'}
            onSelectionChange={it => setFilter({ ...filter, eventType: it === 'none' ? null : (it as NodeEventType) })}
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
        <DyoList
          noSeparator
          headerClassName={headerClasses}
          columnWidths={columnWidths}
          data={data}
          headers={listHeaders}
          footer={<Paginator onChanged={setPagination} length={total} defaultPagination={defaultPagination} />}
          itemBuilder={itemTemplate}
        />
      </DyoCard>
      {!showInfo ? null : (
        <DyoModal
          className="w-1/2 h-1/2"
          titleClassName="pl-4 font-medium text-xl text-bright mb-3"
          title={`${showInfo.event} | ${utcDateToLocale(showInfo.createdAt)}`}
          open={!!showInfo}
          onClose={() => setShowInfo(null)}
        >
          <span className="text-bright font-semibold pl-4">{showInfo.event}</span>
          <JsonEditor className="overflow-y-auto mt-8 p-4" disabled value={showInfo.data} />
        </DyoModal>
      )}
    </>
  )
}

export default NodeAuditList
