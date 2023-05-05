import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import JsonEditor from '@app/components/shared/json-editor-dynamic-module'
import PageHeading from '@app/components/shared/page-heading'
import Paginator, { PaginationSettings } from '@app/components/shared/paginator'
import UserDefaultAvatar from '@app/components/team/user-default-avatar'
import { DyoCard } from '@app/elements/dyo-card'
import DyoDatePicker from '@app/elements/dyo-date-picker'
import { DyoList } from '@app/elements/dyo-list'
import DyoModal from '@app/elements/dyo-modal'
import { useThrottling } from '@app/hooks/use-throttleing'
import { AuditLog, AuditLogList, AuditLogQuery } from '@app/models'
import { auditApiUrl, ROUTE_AUDIT } from '@app/routes'
import { utcDateToLocale } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { useEffect, useState } from 'react'

type AuditFilter = {
  from: Date
  to: Date
  filter?: string
}

const headerClassName = 'uppercase text-bright text-sm font-semibold bg-medium-eased pl-2 py-3 h-11'
const columnWidths = ['w-16', 'w-2/12', 'w-48', 'w-2/12', '', 'w-20']
const sixdays = 1000 * 60 * 60 * 24 * 6 // ms * minutes * hours * day * six
const defaultPagination: PaginationSettings = { pageNumber: 0, pageSize: 10 }
const endOfToday = new Date()
endOfToday.setHours(23, 59, 59, 999)

const AuditLogPage = () => {
  const { t } = useTranslation('audit')

  const [total, setTotal] = useState(0)
  const [data, setData] = useState<AuditLog[]>([])
  const [filter, setFilter] = useState<AuditFilter>({
    from: new Date(endOfToday.getTime() - sixdays),
    to: new Date(endOfToday),
    filter: null,
  })
  const [pagination, setPagination] = useState<PaginationSettings>(defaultPagination)
  const throttle = useThrottling(1000)

  // Data fetching

  const fetchData = async () => {
    const { from, to } = filter
    if (!from || !to) {
      return
    }

    const query: AuditLogQuery = {
      skip: pagination.pageNumber * pagination.pageSize,
      take: pagination.pageSize,
      from: from.toISOString(),
      to: to.toISOString(),
      filter: !filter.filter || filter.filter.trim() === '' ? null : filter.filter,
    }

    const res = await fetch(auditApiUrl(query))

    if (res.ok) {
      const list = (await res.json()) as AuditLogList
      setData(list.items)
      setTotal(list.total)
    } else {
      setData([])
    }
  }

  useEffect(() => {
    throttle(fetchData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  useEffect(() => {
    throttle(fetchData, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination])

  // Info modal:
  const [showInfo, setShowInfo] = useState<AuditLog>(null)
  const onShowInfoClick = (logEntry: AuditLog) => setShowInfo(logEntry)

  // Handlers
  const onDateRangedChanged = dates => {
    const [start, end] = dates
    if (end !== null) end.setHours(23, 59, 59, 999) // end of the day

    setFilter({ ...filter, from: start, to: end })
  }

  const onTextFilterChanged = text => {
    setFilter({ ...filter, filter: text })
  }

  // Render
  const selfLink: BreadcrumbLink = {
    name: t('common:audit'),
    url: ROUTE_AUDIT,
  }

  const listHeaders = [
    '',
    ...['common:email', 'common:date', 'common:event', 'common:data', 'common:actions'].map(it => t(it)),
  ]

  const itemTemplate = (log: AuditLog) => /* eslint-disable react/jsx-key */ [
    <div className="w-10 ml-auto">
      <UserDefaultAvatar />
    </div>,
    <div className="font-semibold min-w-max">{log.email}</div>,
    <div className="min-w-max">{utcDateToLocale(log.createdAt)}</div>,
    <div>{log.serviceCall}</div>,
    <div className="cursor-pointer max-w-4xl truncate" onClick={() => onShowInfoClick(log)}>
      {JSON.stringify(log.data)}
    </div>,
    <div className="text-center">
      <Image
        className="aspect-square cursor-pointer"
        src="/eye.svg"
        alt={t('common:view')}
        width={24}
        height={24}
        onClick={() => onShowInfoClick(log)}
      />
    </div>,
  ]
  /* eslint-enable react/jsx-key */

  return (
    <Layout title={t('common:audit')}>
      <PageHeading pageLink={selfLink} />
      <>
        <Filters setTextFilter={onTextFilterChanged}>
          <DyoDatePicker
            selectsRange
            startDate={filter.from}
            endDate={filter.to}
            onChange={onDateRangedChanged}
            shouldCloseOnSelect={false}
            maxDate={new Date()}
            isClearable
            className="ml-8 w-1/4"
          />
        </Filters>

        <DyoCard className="relative mt-4 overflow-auto">
          <DyoList
            noSeparator
            headerClassName={headerClassName}
            columnWidths={columnWidths}
            data={data}
            headers={listHeaders}
            footer={<Paginator onChanged={setPagination} length={total} defaultPagination={defaultPagination} />}
            itemBuilder={itemTemplate}
          />
        </DyoCard>
      </>

      {!showInfo ? null : (
        <DyoModal
          className="w-1/2 h-1/2"
          titleClassName="pl-4 font-medium text-xl text-bright mb-3"
          title={`${showInfo.email} | ${utcDateToLocale(showInfo.createdAt)}`}
          open={!!showInfo}
          onClose={() => setShowInfo(null)}
        >
          <span className="text-bright font-semibold pl-4">{showInfo.serviceCall}</span>
          <JsonEditor className="overflow-y-auto mt-8 p-4" disabled value={showInfo.data} />
        </DyoModal>
      )}
    </Layout>
  )
}

export default AuditLogPage
