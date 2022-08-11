import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import JsonEditor from '@app/components/shared/json-editor-dynamic-module'
import PageHeading from '@app/components/shared/page-heading'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoDatePicker } from '@app/elements/dyo-date-picker'
import { DyoList } from '@app/elements/dyo-list'
import DyoModal from '@app/elements/dyo-modal'
import { DateRangeFilter, dateRangeFilterFor, TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import { AuditLog, beautifyAuditLogEvent } from '@app/models'
import { ROUTE_AUDIT } from '@app/routes'
import { utcDateToLocale, withContextAuthorization } from '@app/utils'
import { cruxFromContext } from '@server/crux/crux'
import clsx from 'clsx'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useMemo, useState } from 'react'

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

  const selfLink: BreadcrumbLink = {
    name: t('common:audit'),
    url: ROUTE_AUDIT,
  }

  const listHeaders = ['common:name', 'common:date', 'event', 'info'].map(it => t(it))
  const defaultHeaderClass = 'uppercase text-bright text-sm font-bold bg-medium-eased pl-2 py-3 h-11'
  const headerClassNames = [
    clsx(defaultHeaderClass, 'rounded-tl-lg w-20 min-w-full pl-4'),
    ...Array.from({ length: listHeaders.length - 2 }).map(() => defaultHeaderClass),
    clsx(defaultHeaderClass, 'rounded-tr-lg pr-16'),
  ]

  return (
    <Layout title={t('common:auditLog')}>
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

      <DyoCard className="relative mt-4">
        <DyoList
          className=""
          noSeparator
          headerClassName={headerClassNames}
          headers={listHeaders}
          data={filters.filtered}
          itemBuilder={it => {
            /* eslint-disable react/jsx-key */
            return [
              <div className="font-semibold min-w-max pl-2">{it.identityName}</div>,
              <div className="min-w-max">{utcDateToLocale(it.date)}</div>,
              <div>{beautifyAuditLogEvent(it.event)}</div>,
              <div className="cursor-pointer" onClick={() => onShowInfoClick(it)}>
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
