import DeploymentStatusTag from '@app/components/projects/versions/deployments/deployment-status-tag'
import Filters from '@app/components/shared/filters'
import { DyoCard } from '@app/elements/dyo-card'
import DyoFilterChips from '@app/elements/dyo-filter-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoIcon from '@app/elements/dyo-icon'
import DyoModal from '@app/elements/dyo-modal'
import DyoTable, { DyoColumn, sortDate, sortEnum, sortString } from '@app/elements/dyo-table'
import { EnumFilter, enumFilterFor, TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { Deployment, DeploymentStatus, DEPLOYMENT_STATUS_VALUES } from '@app/models'
import { auditToLocaleDate } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'

interface NodeDeploymentListProps {
  deployments: Deployment[]
}

type DeploymentFilter = TextFilter & EnumFilter<DeploymentStatus>

const NodeDeploymentList = (props: NodeDeploymentListProps) => {
  const { deployments: propsDeployments } = props

  const { t } = useTranslation('deployments')
  const routes = useTeamRoutes()
  const router = useRouter()

  const [showInfo, setShowInfo] = useState<Deployment>(null)

  const filters = useFilters<Deployment, DeploymentFilter>({
    filters: [
      textFilterFor<Deployment>(it => [it.project.name, it.version.name, it.prefix]),
      enumFilterFor<Deployment, DeploymentStatus>(it => [it.status]),
    ],
    initialData: propsDeployments,
  })

  const onRowClick = async (data: Deployment) => await router.push(routes.deployment.details(data.id))

  return (
    <>
      {propsDeployments.length ? (
        <>
          <Filters setTextFilter={it => filters.setFilter({ text: it })}>
            <DyoFilterChips
              className="pl-6"
              choices={DEPLOYMENT_STATUS_VALUES}
              converter={it => t(`common:deploymentStatuses.${it}`)}
              selection={filters.filter?.enum}
              onSelectionChange={type => {
                filters.setFilter({
                  enum: type,
                })
              }}
            />
          </Filters>
          <DyoCard className="relative mt-4">
            <DyoTable
              data={filters.filtered}
              dataKey="id"
              onRowClick={onRowClick}
              initialSortColumn={3}
              initialSortDirection="asc"
            >
              <DyoColumn
                header={t('common:project')}
                body={(it: Deployment) => it.project.name}
                className="w-3/12"
                sortable
                sortField="project.name"
                sort={sortString}
              />
              <DyoColumn
                header={t('common:version')}
                body={(it: Deployment) => it.version.name}
                className="w-1/12"
                sortable
                sortField="version.name"
                sort={sortString}
              />
              <DyoColumn
                header={t('common:prefix')}
                field="prefix"
                className="w-2/12"
                sortable
                sortField="prefix"
                sort={sortString}
              />
              <DyoColumn
                header={t('common:updatedAt')}
                body={(it: Deployment) => auditToLocaleDate(it.audit)}
                className="w-2/12"
                suppressHydrationWarning
                sortable
                sortField={it => it.audit.updatedAt ?? it.audit.createdAt}
                sort={sortDate}
              />
              <DyoColumn
                header={t('common:status')}
                body={(it: Deployment) => <DeploymentStatusTag status={it.status} className="w-fit mx-auto" />}
                className="text-center"
                sortable
                sortField="status"
                sort={sortEnum(DEPLOYMENT_STATUS_VALUES)}
              />
              <DyoColumn
                header={t('common:actions')}
                className="w-40 text-center"
                preventClickThrough
                body={(it: Deployment) => (
                  <>
                    <div className="inline-block mr-2">
                      <Link href={routes.deployment.details(it.id)} passHref>
                        <DyoIcon src="/eye.svg" alt={t('common:view')} size="md" />
                      </Link>
                    </div>

                    <DyoIcon
                      src="/note.svg"
                      alt={t('common:note')}
                      size="md"
                      className={!!it.note && it.note.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'}
                      onClick={() => !!it.note && it.note.length > 0 && setShowInfo(it)}
                    />
                  </>
                )}
              />
            </DyoTable>
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
          title={t('common:note')}
          open={!!showInfo}
          onClose={() => setShowInfo(null)}
        >
          <p className="text-bright mt-8 break-all overflow-y-auto">{showInfo.note}</p>
        </DyoModal>
      )}
    </>
  )
}

export default NodeDeploymentList
