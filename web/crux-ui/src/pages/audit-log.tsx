import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import JsonEditor from '@app/components/shared/json-editor-dynamic-module'
import PageHeading from '@app/components/shared/page-heading'
import Paginator, { PaginationSettings } from '@app/components/shared/paginator'
import { DyoCard } from '@app/elements/dyo-card'
import DyoDatePicker from '@app/elements/dyo-date-picker'
import { DyoList } from '@app/elements/dyo-list'
import DyoModal from '@app/elements/dyo-modal'
import { useThrottling } from '@app/hooks/use-throttleing'
import { AuditLog, AuditLogListRequest, beautifyAuditLogEvent } from '@app/models'
import { API_AUDIT, API_AUDIT_COUNT, ROUTE_AUDIT } from '@app/routes'
import { utcDateToLocale } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'

type AuditFilter = {
  start: Date
  end: Date
  keyword: string
}

const headerClassName = 'uppercase text-bright text-sm font-semibold bg-medium-eased pl-2 py-3 h-11'
const columnWidths = ['w-16', 'w-2/12', 'w-48', 'w-2/12', '', 'w-20']
const sixdays = 1000 * 60 * 60 * 24 * 6 // ms * minutes * hours * day * six
const defaultPagination: PaginationSettings = { pageNumber: 0, pageSize: 10 }
const now = Date.now()

const AuditLogPage = () => {
  const { t } = useTranslation('audit')

  const [dataCount, setCount] = useState(0)
  const [data, setData] = useState<AuditLog[]>([])
  const [filter, setFilter] = useState<AuditFilter>({
    start: new Date(Date.now() - sixdays),
    end: new Date(now),
    keyword: '',
  })
  const [pagination, setPagination] = useState<PaginationSettings>(defaultPagination)
  const throttle = useThrottling(1000)

  // Data fetching
  const getRequest = (): AuditLogListRequest => ({
    ...pagination,
    createdFrom: filter.start?.toString(),
    createdTo: filter.end ? filter.end.toString() : new Date(now).toString(),
    keyword: filter.keyword,
  })

  const fetchDataCount = async () => {
    const res = await fetch(API_AUDIT_COUNT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(getRequest()),
    })

    if (res.ok) {
      const json = await res.json()
      setCount(json as number)
    } else {
      setCount(0)
    }
  }

  const fetchData = async () => {
    fetchDataCount()
    const res = await fetch(API_AUDIT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(getRequest()),
    })

    if (res.ok) {
      const json = await res.json()
      setData(json as AuditLog[])
    } else {
      setData([])
    }
  }

  useEffect(() => {
    throttle(() => {
      fetchData()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  useEffect(() => {
    throttle(() => {
      fetchData()
    }, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination])

  // Info modal:
  const [showInfo, setShowInfo] = useState<AuditLog>(null)
  const parsedJSONInfo = useMemo(() => (showInfo ? JSON.parse(showInfo.info) : null), [showInfo])
  const onShowInfoClick = (logEntry: AuditLog) => setShowInfo(logEntry)

  // Handlers
  const onDateRangedChanged = dates => {
    const [start, end] = dates
    if (end !== null) end.setHours(23, 59, 59, 999) // end of the day

    setFilter({ ...filter, start, end })
  }

  const onTextFilterChanged = text => {
    setFilter({ ...filter, keyword: text })
  }

  // Render
  const selfLink: BreadcrumbLink = {
    name: t('common:audit'),
    url: ROUTE_AUDIT,
  }

  const listHeaders = ['', ...['common:email', 'common:date', 'event', 'data', 'common:actions'].map(it => t(it))]

  const itemTemplate = (log: AuditLog) => /* eslint-disable react/jsx-key */ [
    <div className="w-10 ml-auto">
      <Image src="/default_avatar.svg" width={38} height={38} layout="fixed" />
    </div>,
    <div className="font-semibold min-w-max">{log.identityEmail}</div>,
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
      <>
        <Filters setTextFilter={onTextFilterChanged}>
          <DyoDatePicker
            selectsRange
            startDate={filter.start}
            endDate={filter.end}
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
            footer={<Paginator onChanged={setPagination} length={dataCount} defaultPagination={defaultPagination} />}
            itemBuilder={itemTemplate}
          />
        </DyoCard>
      </>

      {!showInfo ? null : (
        <DyoModal
          className="w-1/2 h-1/2"
          titleClassName="pl-4 font-medium text-xl text-bright mb-3"
          title={`${showInfo.identityEmail} | ${utcDateToLocale(showInfo.date)}`}
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
