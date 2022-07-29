import { Layout, PageHead } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import JsonEditor from '@app/components/shared/json-editor-dynamic-module'
import PageHeading from '@app/components/shared/page-heading'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoList } from '@app/elements/dyo-list'
import DyoModal from '@app/elements/dyo-modal'
import { AuditLog, beautifyAuditLogEvent } from '@app/models'
import { ROUTE_TEAMS_AUDIT } from '@app/routes'
import { utcDateToLocale, withContextAuthorization } from '@app/utils'
import { cruxFromContext } from '@server/crux/crux'
import clsx from 'clsx'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import React, { useMemo, useState } from 'react'

interface AuditLogPageProps {
  auditLog: AuditLog[]
}

const AuditLogPage = (props: AuditLogPageProps) => {
  const { t } = useTranslation('audit')

  const { auditLog } = props

  const [showInfo, setShowInfo] = useState<AuditLog>(null)

  const parsedJSONInfo = useMemo(() => (showInfo ? JSON.parse(showInfo.info) : null), [showInfo])

  const onShowInfoClick = (logEntry: AuditLog) => setShowInfo(logEntry)

  const selfLink: BreadcrumbLink = {
    name: t('common:audit'),
    url: ROUTE_TEAMS_AUDIT,
  }

  const listHeaders = ['common:name', 'common:date', 'event', 'info'].map(it => t(it))
  const defaultHeaderClass = 'uppercase text-bright text-sm font-bold bg-medium-eased pl-2 py-3 h-11'
  const headerClassNames = [
    clsx(defaultHeaderClass, 'rounded-tl-lg w-20 min-w-full pl-4'),
    ...Array.from({ length: listHeaders.length - 2 }).map(() => defaultHeaderClass),
    clsx(defaultHeaderClass, 'rounded-tr-lg pr-16'),
  ]

  return (
    <Layout>
      <PageHead title={t('title')} />
      <PageHeading pageLink={selfLink} />

      <DyoCard className="relative">
        <DyoList
          className=""
          noSeparator
          headerClassName={headerClassNames}
          headers={listHeaders}
          data={auditLog}
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
