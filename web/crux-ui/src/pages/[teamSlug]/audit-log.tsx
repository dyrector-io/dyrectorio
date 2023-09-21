import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import JsonEditor from '@app/components/shared/json-editor-dynamic-module'
import PageHeading from '@app/components/shared/page-heading'
import { PaginationSettings } from '@app/components/shared/paginator'
import UserDefaultAvatar from '@app/components/team/user-default-avatar'
import { DyoCard } from '@app/elements/dyo-card'
import DyoDatePicker from '@app/elements/dyo-date-picker'
import DyoIcon from '@app/elements/dyo-icon'
import DyoModal from '@app/elements/dyo-modal'
import DyoTable, { DyoColumn } from '@app/elements/dyo-table'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { useThrottling } from '@app/hooks/use-throttleing'
import { AuditLog, AuditLogList, AuditLogQuery, auditToMethod } from '@app/models'
import { getEndOfToday, utcDateToLocale } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import { useEffect, useState } from 'react'

type AuditFilter = {
  from: Date
  to: Date
  filter?: string
}

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

  const [showInfo, setShowInfo] = useState<AuditLog>(null)
  const onShowInfoClick = (logEntry: AuditLog) => setShowInfo(logEntry)

  const onDateRangedChanged = dates => {
    const [start, end] = dates
    if (end !== null) end.setHours(23, 59, 59, 999) // end of the day

    setFilter({ ...filter, from: start, to: end })
  }

  const onTextFilterChanged = text => {
    setFilter({ ...filter, filter: text })
  }

  const selfLink: BreadcrumbLink = {
    name: t('common:audit'),
    url: routes.audit.list(),
  }

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
          <DyoTable
            data={data}
            dataKey="createdAt"
            pagination="server"
            paginationTotal={total}
            onServerPagination={setPagination}
          >
            <DyoColumn
              className="w-16"
              body={(it: AuditLog) =>
                it.actorType === 'deployment-token' ? (
                  <DyoIcon src="/robot-avatar.svg" alt={t('common:robotAvatar')} size="xl" className="mx-auto" />
                ) : (
                  <UserDefaultAvatar className="mx-auto" />
                )
              }
            />
            <DyoColumn
              header={t('common:name')}
              className="w-1/6"
              body={(it: AuditLog) => (
                <div title={it.actorType !== 'user' ? null : it.user.email} className="font-semibold min-w-max">
                  {it.name}
                </div>
              )}
            />
            <DyoColumn
              header={t('common:date')}
              className="w-48"
              suppressHydrationWarning
              bodyClassName="min-w-max"
              body={(it: AuditLog) => utcDateToLocale(it.createdAt)}
            />
            <DyoColumn header={t('common:method')} className="w-32" body={(it: AuditLog) => auditToMethod(it)} />
            <DyoColumn header={t('common:event')} className="w-1/6" field="event" />
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
              className="w-24 text-center"
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
