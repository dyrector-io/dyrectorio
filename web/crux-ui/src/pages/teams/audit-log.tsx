import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
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
import React, { useState } from 'react'

interface AuditLogPageProps {
  auditLog: AuditLog[]
}

const AuditLogPage = (props: AuditLogPageProps) => {
  const { t } = useTranslation('audit')

  const { auditLog } = props

  const [showInfo, setShowInfo] = useState<AuditLog>(null)

  const onShowInfoClick = (logEntry: AuditLog) => setShowInfo(logEntry)

  const selfLink: BreadcrumbLink = {
    name: t('common:audit'),
    url: ROUTE_TEAMS_AUDIT,
  }

  const listHeaders = ['common:name', 'common:date', 'event', 'info'].map(it => t(it))
  const defaultHeaderClass = 'uppercase text-bright text-sm font-bold bg-medium-eased pl-2 py-3 h-11'
  const headerClassNames = [
    clsx(defaultHeaderClass, 'rounded-tl-lg pl-16'),
    ...Array.from({ length: listHeaders.length - 2 }).map(() => defaultHeaderClass),
    clsx(defaultHeaderClass, 'rounded-tr-lg pr-16'),
  ]

  return (
    <Layout>
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
              <div className="font-semibold ml-14 py-1 h-8">{it.identityName}</div>,
              <div>{utcDateToLocale(it.date)}</div>,
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
          <>
            <span className="text-bright font-semibold">{beautifyAuditLogEvent(showInfo.event)}</span>

            <p className="text-bright mt-8 overflow-y-auto">{showInfo.info}</p>
          </>
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
