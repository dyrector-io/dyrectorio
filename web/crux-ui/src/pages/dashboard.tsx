import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoExpandableText from '@app/elements/dyo-expandable-text'
import { DyoLabel } from '@app/elements/dyo-label'
import { DyoList } from '@app/elements/dyo-list'
import LoadingIndicator from '@app/elements/loading-indicator'
import { AuditLog, beautifyAuditLogEvent, Dashboard } from '@app/models'
import { API_DASHBOARD, deploymentUrl, ROUTE_DASHBOARD } from '@app/routes'
import { fetcher, utcDateToLocale } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import useSWR from 'swr'

const headerClassName = 'uppercase text-bright text-sm font-semibold bg-medium-eased pl-2 py-3 h-11'
const columnWidths = ['w-16', 'w-2/12', 'w-48', 'w-2/12', '']

const DashboardPage = () => {
  const { t, lang } = useTranslation('dashboard')
  const { data } = useSWR<Dashboard>(API_DASHBOARD, fetcher)

  const selfLink: BreadcrumbLink = {
    name: t('common:dashboard'),
    url: ROUTE_DASHBOARD,
  }

  const getStatisticIcon = (property: string) => {
    switch (property) {
      case 'auditLogEntries':
        return 'audits'
      case 'failedDeployments':
        return 'failed-deployments'
      default:
        return property
    }
  }

  const getStatisticLabel = (property: string) => {
    switch (property) {
      case 'users':
        return 'common:users'
      case 'deployments':
        return 'common:deployments'
      default:
        return property
    }
  }

  const formatCount = (count: number) => Intl.NumberFormat(lang, { notation: 'compact' }).format(count)

  const statisticItem = (property: string, count: number) => (
    <DyoCard className="flex flex-col p-4 justify-items-center items-center mb-4 break-inside-avoid" key={property}>
      <Image
        src={`/dashboard/${getStatisticIcon(property)}.svg`}
        width={46}
        height={46}
        alt={t(getStatisticLabel(property))}
      />
      <DyoLabel className="text-lg font-semibold my-2" textColor="text-bright">
        {formatCount(count)}
      </DyoLabel>
      <DyoLabel className="text-sm" textColor="text-light-eased">
        {t(getStatisticLabel(property))}
      </DyoLabel>
    </DyoCard>
  )

  const listHeaders = ['', ...['common:email', 'common:date', 'common:event', 'common:data'].map(it => t(it))]

  const itemTemplate = (log: AuditLog) => /* eslint-disable react/jsx-key */ [
    <div className="w-10 ml-auto">
      <Image src="/default_avatar.svg" width={38} height={38} layout="fixed" alt={t('')} />
    </div>,
    <div className="font-semibold min-w-max">{log.identityEmail}</div>,
    <div className="min-w-max">{utcDateToLocale(log.date)}</div>,
    <div>{beautifyAuditLogEvent(log.event)}</div>,
    <div className="max-w-4xl truncate">{log.info}</div>,
  ]
  /* eslint-enable react/jsx-key */

  return (
    <Layout title={t('common:dashboard')}>
      <PageHeading pageLink={selfLink} />
      {!data && <LoadingIndicator className="mx-auto" />}
      {data && (
        <div className="flex flex-col">
          {/* Statistics */}
          <div className="flex flex-col">
            <DyoLabel className="mb-2 text-lg" textColor="text-light">
              {t('statistics')}
            </DyoLabel>

            <div className="columns-1 md:columns-2 lg:columns-3 2xl:columns-6 gap-4">
              {Object.keys(data)
                .filter(it => typeof data[it] === 'number')
                .map(it => statisticItem(it, data[it]))}
            </div>
          </div>

          <div className="flex flex-row">
            {data.nodes.length > 0 && (
              <div className={clsx('flex flex-col mr-4', data.nodes.length > 1 ? 'min-w-[50%]' : null)}>
                <DyoLabel className="mb-2 mt-4 text-lg" textColor="text-light">
                  {t('activeNodes')}
                </DyoLabel>

                <div className={clsx('columns-1', data.nodes.length > 1 ? 'lg:columns-2' : null, 'gap-4')}>
                  {data.nodes.map(it => (
                    <DyoCard className="flex flex-col p-4 break-inside-avoid mb-4" key={it.id}>
                      <DyoLabel className="font-semibold text-ellipsis break-words" textColor="text-bright">
                        {it.name}
                      </DyoLabel>

                      <div className="flex flex-row justify-start my-4">
                        <DyoLabel textColor="text-light-eased">{`${t('common:address')}:`}</DyoLabel>
                        <span className="text-bright ml-2 font-semibold">{it.address}</span>
                      </div>
                      <div className="flex flex-row justify-start">
                        <DyoLabel textColor="text-light-eased">{`${t('common:version')}:`}</DyoLabel>
                        <span className="text-bright font-semibold ml-2">{it.version}</span>
                      </div>
                    </DyoCard>
                  ))}
                </div>
              </div>
            )}

            {data.latestDeployments.length > 0 && (
              <div className="flex flex-col w-full">
                <DyoLabel className="mb-2 mt-4 text-lg" textColor="text-light">
                  {t('lastDeploys')}
                </DyoLabel>
                <div className={clsx('columns-1', data.nodes.length > 1 ? null : 'lg:columns-2')}>
                  {data.latestDeployments.map(it => (
                    <DyoCard className="flex flex-col p-4 mb-4 break-inside-avoid" key={it.id}>
                      <div className="flex flex-row justify-between">
                        <div className="flex flex-row justify-start">
                          <DyoLabel textColor="text-light-eased mb-4">{`${t('common:product')}:`}</DyoLabel>
                          <span className="text-bright font-semibold ml-2 text-ellipsis break-words">{it.product}</span>
                        </div>
                        <DyoLabel textColor="text-light-eased ml-2">{utcDateToLocale(it.deployedAt)}</DyoLabel>
                      </div>

                      <div className="flex flex-row justify-start">
                        <DyoLabel textColor="text-light-eased mb-4">{`${t('common:version')}:`}</DyoLabel>
                        <span className="text-bright font-semibold ml-2 text-ellipsis break-words">{it.version}</span>
                      </div>

                      <div className="flex flex-row justify-start">
                        <DyoLabel textColor="text-light-eased mb-4">{`${t('common:node')}:`}</DyoLabel>
                        <span className="text-bright font-semibold ml-2 text-ellipsis break-words">{it.node}</span>
                      </div>

                      <div className="flex flex-col">
                        <DyoLabel textColor="text-light-eased mb-2">{`${t('common:changelog')}`}</DyoLabel>
                        <DyoExpandableText
                          text={it.changelog ? it.changelog : t('common:emptyChangelog')}
                          lineClamp={4}
                          modalTitle={t('common:changelog')}
                          className="text-sm text-light-eased"
                          marginClassName="mb-4"
                        />
                      </div>

                      <div className="flex justify-end">
                        <DyoButton className="px-4" outlined href={deploymentUrl(it.productId, it.versionId, it.id)}>
                          <div className="flex flex-row items-center gap-2">{t('common:view')}</div>
                        </DyoButton>
                      </div>
                    </DyoCard>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <DyoLabel className="mb-2 mt-4 text-lg" textColor="text-light">
              {t('lastAuditLogs')}
            </DyoLabel>
            <DyoCard className="overflow-auto">
              <DyoList
                noSeparator
                headerClassName={headerClassName}
                columnWidths={columnWidths}
                data={data.auditLog}
                headers={listHeaders}
                itemBuilder={itemTemplate}
              />
            </DyoCard>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default DashboardPage
