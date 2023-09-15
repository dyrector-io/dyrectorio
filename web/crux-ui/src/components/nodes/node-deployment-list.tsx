import DeploymentStatusTag from '@app/components/projects/versions/deployments/deployment-status-tag'
import Filters from '@app/components/shared/filters'
import { DyoCard } from '@app/elements/dyo-card'
import DyoFilterChips from '@app/elements/dyo-filter-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoIcon from '@app/elements/dyo-icon'
import { DyoList } from '@app/elements/dyo-list'
import DyoModal from '@app/elements/dyo-modal'
import { EnumFilter, enumFilterFor, TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import { auditFieldGetter, dateSort, enumSort, sortHeaderBuilder, stringSort, useSorting } from '@app/hooks/use-sorting'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { Deployment, DeploymentStatus, DEPLOYMENT_STATUS_VALUES } from '@app/models'
import { auditToLocaleDate } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'

interface NodeDeploymentListProps {
  deployments: Deployment[]
}

type DeploymentFilter = TextFilter & EnumFilter<DeploymentStatus>
type DeploymentSorting = 'project' | 'version' | 'prefix' | 'updatedAt' | 'status'

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

  const sorting = useSorting<Deployment, DeploymentSorting>(filters.filtered, {
    initialField: 'updatedAt',
    initialDirection: 'asc',
    sortFunctions: {
      project: stringSort,
      version: stringSort,
      prefix: stringSort,
      updatedAt: dateSort,
      status: enumSort(DEPLOYMENT_STATUS_VALUES),
    },
    fieldGetters: {
      project: it => it.project.name,
      version: it => it.version.name,
      updatedAt: auditFieldGetter,
    },
  })

  const headers = [
    'common:project',
    'common:version',
    'common:prefix',
    'common:updatedAt',
    'common:status',
    'common:actions',
  ]
  const defaultHeaderClass = 'h-11 uppercase text-bright text-sm bg-medium-eased py-3 px-2 font-semibold'
  const headerClasses = [
    clsx('rounded-tl-lg pl-6', defaultHeaderClass),
    ...Array.from({ length: headers.length - 3 }).map(() => defaultHeaderClass),
    clsx('text-center', defaultHeaderClass),
    clsx('rounded-tr-lg pr-6 text-center', defaultHeaderClass),
  ]

  const defaultItemClass = 'h-11 min-h-min text-light-eased p-2 w-fit'
  const itemClasses = [
    clsx('pl-6', defaultItemClass),
    ...Array.from({ length: headerClasses.length - 3 }).map(() => defaultItemClass),
    clsx('text-center', defaultItemClass),
    clsx('pr-6 text-center', defaultItemClass),
  ]

  const onCellClick = async (data: Deployment, row: number, col: number) => {
    if (col >= headers.length - 1) {
      return
    }

    await router.push(routes.deployment.details(data.id))
  }

  const itemTemplate = (item: Deployment) => /* eslint-disable react/jsx-key */ [
    item.project.name,
    item.version.name,
    <span>{item.prefix}</span>,
    <span suppressHydrationWarning>{auditToLocaleDate(item.audit)}</span>,
    <DeploymentStatusTag status={item.status} className="w-fit mx-auto" />,
    <>
      <div className="inline-block mr-2">
        <Link href={routes.deployment.details(item.id)} passHref>
          <DyoIcon src="/eye.svg" alt={t('common:view')} size="md" />
        </Link>
      </div>

      <DyoIcon
        src="/note.svg"
        alt={t('common:note')}
        size="md"
        className={!!item.note && item.note.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'}
        onClick={() => !!item.note && item.note.length > 0 && setShowInfo(item)}
      />
    </>,
  ]
  /* eslint-enable react/jsx-key */

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
            <DyoList
              headers={[...headers]}
              headerClassName={headerClasses}
              itemClassName={itemClasses}
              data={sorting.items}
              noSeparator
              itemBuilder={itemTemplate}
              headerBuilder={sortHeaderBuilder<Deployment, DeploymentSorting>(
                sorting,
                {
                  'common:project': 'project',
                  'common:version': 'version',
                  'common:prefix': 'prefix',
                  'common:updatedAt': 'updatedAt',
                  'common:status': 'status',
                },
                text => t(text),
              )}
              cellClick={onCellClick}
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
