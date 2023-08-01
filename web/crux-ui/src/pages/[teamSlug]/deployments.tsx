import { Layout } from '@app/components/layout'
import CopyDeploymentCard from '@app/components/projects/versions/deployments/copy-deployment-card'
import DeploymentStatusTag from '@app/components/projects/versions/deployments/deployment-status-tag'
import useCopyDeploymentState from '@app/components/projects/versions/deployments/use-copy-deployment-state'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import PageHeading from '@app/components/shared/page-heading'
import { DyoCard } from '@app/elements/dyo-card'
import DyoFilterChips from '@app/elements/dyo-filter-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoIcon from '@app/elements/dyo-icon'
import { DyoList } from '@app/elements/dyo-list'
import DyoModal, { DyoConfirmationModal } from '@app/elements/dyo-modal'
import { defaultApiErrorHandler } from '@app/errors'
import useConfirmation from '@app/hooks/use-confirmation'
import { EnumFilter, enumFilterFor, TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import useTeamRoutes from '@app/hooks/use-team-routes'
import {
  Deployment,
  deploymentIsCopiable,
  deploymentIsDeletable,
  DeploymentStatus,
  DEPLOYMENT_STATUS_VALUES,
} from '@app/models'
import { TeamRoutes } from '@app/routes'
import { auditToLocaleDate, withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import clsx from 'clsx'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

interface DeploymentsPageProps {
  deployments: Deployment[]
}

type DeploymentFilter = TextFilter & EnumFilter<DeploymentStatus>

const DeploymentsPage = (props: DeploymentsPageProps) => {
  const { deployments: propsDeployments } = props

  const { t } = useTranslation('deployments')
  const routes = useTeamRoutes()
  const router = useRouter()

  const [deployments, setDeployments] = useState(propsDeployments)

  const handleApiError = defaultApiErrorHandler(t)

  const [showInfo, setShowInfo] = useState<Deployment>(null)
  const [copyDeploymentTarget, setCopyDeploymentTarget] = useCopyDeploymentState({
    handleApiError,
  })
  const [confirmModalConfig, confirm] = useConfirmation()

  const onDeleteDeployment = async (deployment: Deployment) => {
    const confirmed = await confirm({
      title: t('common:areYouSure'),
      description:
        deployment.status === 'successful'
          ? t('deployments:proceedYouDeletePrefix', {
              node: deployment.node.name,
              prefix: deployment.prefix,
            })
          : null,
      confirmText: t('common:delete'),
      confirmColor: 'bg-error-red',
    })

    if (!confirmed) {
      return
    }

    const res = await fetch(routes.deployment.api.details(deployment.id), { method: 'DELETE' })
    if (!res.ok) {
      handleApiError(res)
      return
    }

    setDeployments([...deployments.filter(it => it.id !== deployment.id)])
  }

  const onDeploymentCopied = async (deploymentId: string) => {
    await router.push(routes.deployment.details(deploymentId))
  }

  const filters = useFilters<Deployment, DeploymentFilter>({
    filters: [
      textFilterFor<Deployment>(it => [it.project.name, it.version.name, it.node.name, it.prefix]),
      enumFilterFor<Deployment, DeploymentStatus>(it => [it.status]),
    ],
    initialData: deployments,
  })

  useEffect(() => filters.setItems(deployments), [deployments])

  const selfLink: BreadcrumbLink = {
    name: t('common:deployments'),
    url: routes.deployment.list(),
  }

  const headers = [
    'common:project',
    'common:version',
    'common:node',
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
    item.node.name,
    <span>{item.prefix}</span>,
    <span suppressHydrationWarning>{auditToLocaleDate(item.audit)}</span>,
    <DeploymentStatusTag status={item.status} className="w-fit mx-auto" />,
    <>
      <Link href={routes.deployment.details(item.id)} passHref>
        <DyoIcon src="/eye.svg" alt={t('common:view')} size="md" />
      </Link>

      <div className="inline-block mr-2">
        <DyoIcon
          src="/note.svg"
          alt={t('common:note')}
          size="md"
          className={!!item.note && item.note.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'}
          onClick={() => !!item.note && item.note.length > 0 && setShowInfo(item)}
        />
      </div>

      <DyoIcon
        src="/copy.svg"
        alt={t('common:copy')}
        size="md"
        className={deploymentIsCopiable(item.status) ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'}
        onClick={() => deploymentIsCopiable(item.status) && setCopyDeploymentTarget(item.id)}
      />

      {deploymentIsDeletable(item.status) ? (
        <DyoIcon
          className="aspect-square cursor-pointer ml-2"
          src="/trash-can.svg"
          alt={t('common:delete')}
          size="md"
          onClick={() => onDeleteDeployment(item)}
        />
      ) : null}
    </>,
  ]
  /* eslint-enable react/jsx-key */

  return (
    <Layout title={t('common:deployments')}>
      <PageHeading pageLink={selfLink} />

      {!copyDeploymentTarget ? null : (
        <CopyDeploymentCard
          className="p-8 mb-4"
          deployment={copyDeploymentTarget}
          onDeplyomentCopied={onDeploymentCopied}
          onDiscard={() => setCopyDeploymentTarget(null)}
        />
      )}

      {deployments.length ? (
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
              headers={[...headers.map(h => t(h)), '']}
              headerClassName={headerClasses}
              itemClassName={itemClasses}
              data={filters.filtered}
              noSeparator
              itemBuilder={itemTemplate}
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

      <DyoConfirmationModal config={confirmModalConfig} />
    </Layout>
  )
}

export default DeploymentsPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const routes = TeamRoutes.fromContext(context)

  const deployments = await getCruxFromContext<Deployment[]>(context, routes.deployment.api.list())

  return {
    props: {
      deployments,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
