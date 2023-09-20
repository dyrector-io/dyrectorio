import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import JsonEditor from '@app/components/shared/json-editor-dynamic-module'
import PageHeading from '@app/components/shared/page-heading'
import Paginator, { PaginationSettings } from '@app/components/shared/paginator'
import UserDefaultAvatar from '@app/components/team/user-default-avatar'
import { DyoCard } from '@app/elements/dyo-card'
import DyoDatePicker from '@app/elements/dyo-date-picker'
import DyoIcon from '@app/elements/dyo-icon'
import { DyoList } from '@app/elements/dyo-list'
import DyoModal from '@app/elements/dyo-modal'
import DyoTable, { DyoColumn } from '@app/elements/dyo-table'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { useThrottling } from '@app/hooks/use-throttleing'
import { AuditLog, AuditLogList, AuditLogQuery, auditToMethod } from '@app/models'
import { getEndOfToday, utcDateToLocale } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useEffect, useState } from 'react'

type AuditFilter = {
  from: Date
  to: Date
  filter?: string
}

const defaultHeaderClassName = 'uppercase text-bright text-sm font-semibold bg-medium-eased px-2 py-3 h-11'
const defaultItemClass = 'h-12 min-h-min text-light-eased p-2'
const columnWidths = ['w-16', 'w-1/6', 'w-48', 'w-32', 'w-1/6', '', 'w-24']
const sixDays = 1000 * 60 * 60 * 24 * 6 // ms * minutes * hours * day * six
const defaultPagination: PaginationSettings = { pageNumber: 0, pageSize: 10 }

const AuditLogPage = () => {
  const { t } = useTranslation('audit')
  const routes = useTeamRoutes()

  const endOfToday = getEndOfToday()
  const [total, setTotal] = useState(0)
  const [data, setData] = useState<AuditLog[]>([])
  const [filter, setFilter] = useState<AuditFilter>({
    from: new Date(endOfToday.getTime() - sixDays),
    to: new Date(endOfToday),
    filter: null,
  })
  const [pagination, setPagination] = useState<PaginationSettings>(defaultPagination)
  const throttle = useThrottling(1000)

  // Data fetching

  const fetchData = async () => {
    const { from, to } = filter

    const query: AuditLogQuery = {
      skip: pagination.pageNumber * pagination.pageSize,
      take: pagination.pageSize,
      from: (from ?? new Date(endOfToday.getTime() - sixDays)).toISOString(),
      to: (to ?? endOfToday).toISOString(),
      filter: !filter.filter || filter.filter.trim() === '' ? null : filter.filter,
    }

    const res = await fetch(routes.audit.api(query))

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
    url: routes.audit.list(),
  }

  const listHeaders = [
    '',
    ...['common:name', 'common:date', 'common:method', 'common:event', 'common:data', 'common:actions'].map(it =>
      t(it),
    ),
  ]

  const headerClassNames = [
    ...Array.from({ length: listHeaders.length - 1 }).map(() => defaultHeaderClassName),
    clsx('pr-6 text-center', defaultHeaderClassName),
  ]

  const itemClasses = [
    ...Array.from({ length: headerClassNames.length - 1 }).map(() => defaultItemClass),
    clsx('pr-6 text-center', defaultItemClass),
  ]

  const itemTemplate = (log: AuditLog) => /* eslint-disable react/jsx-key */ [
    <div className="w-10 ml-auto">
      {log.actorType === 'deployment-token' ? (
        <DyoIcon src="/robot-avatar.svg" alt={t('common:robotAvatar')} size="xl" />
      ) : (
        <UserDefaultAvatar />
      )}
    </div>,
    <div title={log.actorType !== 'user' ? null : log.user.email} className="font-semibold min-w-max">
      {log.name}
    </div>,
    <div className="min-w-max">{utcDateToLocale(log.createdAt)}</div>,
    <div>{auditToMethod(log)}</div>,
    <div>{log.event}</div>,
    <div className="cursor-pointer max-w-4xl truncate" onClick={() => onShowInfoClick(log)}>
      {JSON.stringify(log.data)}
    </div>,
    <DyoIcon
      className="aspect-square cursor-pointer"
      src="/eye.svg"
      alt={t('common:view')}
      size="md"
      onClick={() => onShowInfoClick(log)}
    />,
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
          <DyoTable data={data} pagination="server" paginationTotal={total} onServerPagination={setPagination}>
            <DyoColumn
              header=""
              width="40px"
              body={(it: AuditLog) =>
                it.actorType === 'deployment-token' ? (
                  <DyoIcon src="/robot-avatar.svg" alt={t('common:robotAvatar')} size="xl" />
                ) : (
                  <UserDefaultAvatar />
                )
              }
            />
            <DyoColumn
              header={t('common:name')}
              width="16%"
              body={(it: AuditLog) => (
                <div title={it.actorType !== 'user' ? null : it.user.email} className="font-semibold min-w-max">
                  {it.name}
                </div>
              )}
            />
            <DyoColumn
              header={t('common:date')}
              suppressHydrationWarning
              bodyClassName="min-w-max"
              body={(it: AuditLog) => utcDateToLocale(it.createdAt)}
            />
            <DyoColumn header={t('common:method')} body={(it: AuditLog) => auditToMethod(it)} />
            <DyoColumn header={t('common:event')} field="event" />
            <DyoColumn
              header={t('common:data')}
              body={(it: AuditLog) => (
                <div className="cursor-pointer max-w-4xl truncate" onClick={() => onShowInfoClick(it)}>
                  {JSON.stringify(it.data)}
                </div>
              )}
            />
            <DyoColumn
              header={t('common:actions')}
              width="10%"
              align="center"
              body={(it: AuditLog) => (
                <DyoIcon
                  className="aspect-square cursor-pointer"
                  src="/eye.svg"
                  alt={t('common:view')}
                  size="md"
                  onClick={() => onShowInfoClick(it)}
                />
              )}
            />
          </DyoTable>
        </DyoCard>
      </>

      {!showInfo ? null : (
        <DyoModal
          className="w-1/2 h-1/2"
          titleClassName="pl-4 font-medium text-xl text-bright mb-3"
          title={`${showInfo.name} | ${utcDateToLocale(showInfo.createdAt)}`}
          open={!!showInfo}
          onClose={() => setShowInfo(null)}
        >
          <span className="text-bright font-semibold pl-4">{auditToMethod(showInfo)}</span>
          <span className="text-bright font-semibold pl-4">{showInfo.event}</span>
          <JsonEditor className="overflow-y-auto mt-8 p-4" disabled value={showInfo.data} />
        </DyoModal>
      )}
    </Layout>
  )
}

export default AuditLogPage
