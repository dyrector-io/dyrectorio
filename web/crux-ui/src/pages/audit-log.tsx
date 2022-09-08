import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import JsonEditor from '@app/components/shared/json-editor-dynamic-module'
import PageHeading from '@app/components/shared/page-heading'
import Paginator from '@app/components/shared/paginator'
import { DyoCard } from '@app/elements/dyo-card'
import DyoDatePicker from '@app/elements/dyo-date-picker'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoList } from '@app/elements/dyo-list'
import DyoModal from '@app/elements/dyo-modal'
import { DateRangeFilter, dateRangeFilterFor, TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import { usePagination } from '@app/hooks/use-pagination'
import { AuditLog, beautifyAuditLogEvent } from '@app/models'
import { ROUTE_AUDIT } from '@app/routes'
import { utcDateToLocale, withContextAuthorization } from '@app/utils'
import { cruxFromContext } from '@server/crux/crux'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'

interface AuditLogPageProps {
  auditLog: AuditLog[]
}

type AuditLogFilter = TextFilter & DateRangeFilter

const AuditLogPage = (props: AuditLogPageProps) => {
  const { t } = useTranslation('audit')

  const { auditLog } = props

  const sixdays = 1000 * 60 * 60 * 24 * 6 // ms * minutes * hours * day * six

  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - sixdays))
  const [endDate, setEndDate] = useState<Date>(new Date())

  const filters = useFilters<AuditLog, AuditLogFilter>({
    initialData: auditLog,
    initialFilter: {
      text: '',
      dateRange: [startDate, endDate],
    },
    filters: [
      textFilterFor<AuditLog>(it => [it.identityEmail, utcDateToLocale(it.date), it.event, it.info]),
      dateRangeFilterFor<AuditLog>(it => [utcDateToLocale(it.date)]),
    ],
  })

  const onChange = dates => {
    const [start, end] = dates
    setStartDate(start)

    if (end !== null) end.setHours(23, 59, 59, 999)
    setEndDate(end)
    filters.setFilter({ dateRange: [start, end] })
  }

  const pagination = usePagination<AuditLog>({
    initialData: auditLog,
    initialPagination: { pageSize: 10, currentPage: 0 },
  })

  const [showInfo, setShowInfo] = useState<AuditLog>(null)

  const parsedJSONInfo = useMemo(() => (showInfo ? JSON.parse(showInfo.info) : null), [showInfo])

  const onShowInfoClick = (logEntry: AuditLog) => setShowInfo(logEntry)

  useEffect(() => {
    pagination.setItems(filters.filtered)
  }, [filters, pagination])

  const selfLink: BreadcrumbLink = {
    name: t('common:audit'),
    url: ROUTE_AUDIT,
  }

  const headerClassName = 'uppercase text-bright text-sm font-semibold bg-medium-eased pl-2 py-3 h-11'
  const columnWidths = ['w-16', 'w-2/12', 'w-48', 'w-2/12', '', 'w-20']
  const listHeaders = ['', ...['common:email', 'common:date', 'event', 'data', 'common:actions'].map(it => t(it))]

  const itemTemplate = (log: AuditLog) => /* eslint-disable react/jsx-key */ [
    <div className="w-10 ml-auto">
      <Image src="/default_avatar.svg" width={38} height={38} layout="fixed" />
    </div>,
    <div className="font-semibold min-w-max pl-2">{log.identityEmail}</div>,
    <div className="min-w-max">{utcDateToLocale(log.date)}</div>,
    <div>{beautifyAuditLogEvent(log.event)}</div>,
    <div className="cursor-pointer max-w-4xl truncate" onClick={() => onShowInfoClick(log)}>
      {log.info}
    </div>,
    <div className="text-center">
      <Image
        src="/eye.svg"
        alt={t('common:view')}
        width={24}
        height={24}
        className="cursor-pointer"
        layout="fixed"
        onClick={() => onShowInfoClick(log)}
      />
    </div>,
  ]
  /* eslint-enable react/jsx-key */

  return (
    <Layout title={t('common:audit')}>
      <PageHeading pageLink={selfLink} />
      {filters.items.length ? (
        <>
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
              noSeparator
              headerClassName={headerClassName}
              columnWidths={columnWidths}
              data={pagination.displayed}
              headers={listHeaders}
              footer={<Paginator pagination={pagination} />}
              itemBuilder={itemTemplate}
            />
          </DyoCard>
        </>
      ) : (
        <DyoHeading element="h3" className="text-md text-center text-light-eased pt-32">
          {t('noItems')}
        </DyoHeading>
      )}

      {!showInfo ? null : (
        <DyoModal
          className="w-1/2 h-1/2"
          titleClassName="pl-4 font-medium text-xl text-bright mb-3"
          title={`${showInfo.identityEmail} | ${showInfo.date}`}
          open={!!showInfo}
          onClose={() => setShowInfo(null)}
        >
          <span className="text-bright font-semibold pl-4">{beautifyAuditLogEvent(showInfo.event)}</span>
          <JsonEditor className="overflow-y-auto mt-8 p-4" disabled value={parsedJSONInfo} />
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
