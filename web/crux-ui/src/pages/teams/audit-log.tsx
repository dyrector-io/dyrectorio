import { Layout, PageHead } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import JsonEditor from '@app/components/shared/json-editor-dynamic-module'
import PageHeading from '@app/components/shared/page-heading'
import Paginator from '@app/components/shared/paginator'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoDatePicker } from '@app/elements/dyo-date-picker'
import { DyoList } from '@app/elements/dyo-list'
import DyoModal from '@app/elements/dyo-modal'
import { DateRangeFilter, dateRangeFilterFor, TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import { usePagination } from '@app/hooks/use-pagination'
import { AuditLog, beautifyAuditLogEvent } from '@app/models'
import { ROUTE_TEAMS_AUDIT } from '@app/routes'
import { utcDateToLocale, withContextAuthorization } from '@app/utils'
import { cruxFromContext } from '@server/crux/crux'
import clsx from 'clsx'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useEffect, useMemo, useState } from 'react'

interface AuditLogPageProps {
  auditLog: AuditLog[]
}

type AuditLogFilter = TextFilter & DateRangeFilter

const AuditLogPage = (props: AuditLogPageProps) => {
  const { t } = useTranslation('audit')

  const { auditLog } = props

  const [startDate, setStartDate] = useState<Date>(null)
  const [endDate, setEndDate] = useState<Date>(null)

  const onChange = dates => {
    const [start, end] = dates
    setStartDate(start)

    if (end !== null) end.setHours(23, 59, 59, 999)
    setEndDate(end)
    filters.setFilter({ dateRange: [start, end] })
  }

  const filters = useFilters<AuditLog, AuditLogFilter>({
    initialData: auditLog,
    initialFilter: {
      text: '',
      dateRange: [null, null],
    },
    filters: [
      textFilterFor<AuditLog>(it => [it.identityName, utcDateToLocale(it.date), it.event, it.info]),
      dateRangeFilterFor<AuditLog>(it => [utcDateToLocale(it.date)]),
    ],
  })

  const [showInfo, setShowInfo] = useState<AuditLog>(null)

  const parsedJSONInfo = useMemo(() => (showInfo ? JSON.parse(showInfo.info) : null), [showInfo])

  const onShowInfoClick = (logEntry: AuditLog) => setShowInfo(logEntry)

  useEffect(() => {
    pagination.setItems(filters.filtered)
  }, [filters])

  const selfLink: BreadcrumbLink = {
    name: t('common:audit'),
    url: ROUTE_TEAMS_AUDIT,
  }

  const pagination = usePagination<AuditLog>({
    initialData: auditLog,
    initialPagination: { pageSize: 10, currentPage: 0 },
  })

  const listHeaders = ['', 'common:name', 'common:date', 'event', 'info'].map(it => t(it))
  const defaultHeaderClass = 'uppercase text-bright text-sm font-bold bg-medium-eased pl-2 py-3 h-11'
  const headerClassNames = [
    defaultHeaderClass,
    clsx(defaultHeaderClass, 'w-20 min-w-full pl-4'),
    ...Array.from({ length: listHeaders.length - 3 }).map(() => defaultHeaderClass),
    clsx(defaultHeaderClass, 'pr-16'),
  ]
  const itemClassNames = ['py-2 w-14'] // Only for the first column

  return (
    <Layout>
      <PageHead title={t('title')} />
      <PageHeading pageLink={selfLink} />

      <Filters setTextFilter={it => filters.setFilter({ text: it })}>
        <DyoDatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={onChange}
          shouldCloseOnSelect={false}
          maxDate={new Date()}
          isClearable
          className="ml-8 w-1/3"
        />
      </Filters>

      <DyoCard className="relative mt-4 overflow-auto">
        <DyoList
          className=""
          noSeparator
          headerClassName={headerClassNames}
          headers={listHeaders}
          data={pagination.displayed}
          footer={<Paginator pagination={pagination} />}
          itemClassName={itemClassNames}
          itemBuilder={it => {
            /* eslint-disable react/jsx-key */
            return [
              <div className="w-10 ml-auto">
                <img src="/default_avatar.svg" />
              </div>,
              <div className="font-semibold min-w-max pl-2">{it.identityName}</div>,
              <div className="min-w-max">{utcDateToLocale(it.date)}</div>,
              <div>{beautifyAuditLogEvent(it.event)}</div>,
              <div className="cursor-pointer max-w-4xl truncate" onClick={() => onShowInfoClick(it)}>
                {it.info}
              </div>,
            ]
            /* eslint-enable react/jsx-key */
          }}
        />
      </DyoCard>

      {!showInfo ? null : (
        <DyoModal
          className="w-1/2 h-1/2"
          title={`${showInfo.identityName} | ${showInfo.date}`}
          open={!!showInfo}
          onClose={() => setShowInfo(null)}
        >
          <span className="text-bright font-semibold">{beautifyAuditLogEvent(showInfo.event)}</span>
          <JsonEditor
            className="text-bright mt-8 overflow-y-auto h-full !pointer-events-auto"
            disabled
            value={parsedJSONInfo}
          />
        </DyoModal>
      )}
    </Layout>
  )
}

export default AuditLogPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const auditLog = await cruxFromContext(context).audit.getAuditLog()

  return {
    props: {
      auditLog,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
