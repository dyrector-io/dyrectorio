import { Layout } from '@app/components/layout'
import DeploymentStatusTag from '@app/components/projects/versions/deployments/deployment-status-tag'
import useCopyDeploymentModal from '@app/components/projects/versions/deployments/use-copy-deployment-confirmation-modal'
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
import { EnumFilter, enumFilterFor, TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import { Deployment, deploymentIsCopiable, DeploymentStatus, DEPLOYMENT_STATUS_VALUES } from '@app/models'
import { API_DEPLOYMENTS, deploymentUrl, ROUTE_DEPLOYMENTS } from '@app/routes'
import { auditToLocaleDate, withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import clsx from 'clsx'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useState } from 'react'

interface DeploymentsPageProps {
  deployments: Deployment[]
}

type DeploymentFilter = TextFilter & EnumFilter<DeploymentStatus>

const DeploymentsPage = (props: DeploymentsPageProps) => {
  const { deployments } = props
  const { t } = useTranslation('deployments')
  const router = useRouter()

  const [showInfo, setShowInfo] = useState<Deployment>(null)

  const handleApiError = defaultApiErrorHandler(t)
  const [confirmationModal, copyDeployment] = useCopyDeploymentModal(handleApiError)

  const onCopyDeployment = async (deploymentId: string) => {
    const deployment = deployments.find(d => d.id === deploymentId)
    const url = await copyDeployment({
      deploymentId: deployment.id,
    })

    if (!url) {
      return
    }

    await router.push(url)
  }

  const filters = useFilters<Deployment, DeploymentFilter>({
    filters: [
      textFilterFor<Deployment>(it => [it.project.name, it.version.name, it.node.name, it.prefix]),
      enumFilterFor<Deployment, DeploymentStatus>(it => [it.status]),
    ],
    initialData: deployments,
  })

  const selfLink: BreadcrumbLink = {
    name: t('common:deployments'),
    url: ROUTE_DEPLOYMENTS,
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
  const defaultHeaderClass = 'h-11 uppercase text-bright text-sm bg-medium-eased py-3 pl-4 font-semibold'
  const headerClasses = [
    clsx('rounded-tl-lg', defaultHeaderClass),
    ...Array.from({ length: headers.length - 3 }).map(() => defaultHeaderClass),
    clsx('text-center', defaultHeaderClass),
    clsx('text-center rounded-tr-lg', defaultHeaderClass),
  ]

  const onCellClick = async (data: Deployment, row: number, col: number) => {
    if (col >= headers.length - 1) {
      return
    }

    await router.push(deploymentUrl(data.id))
  }

  const itemTemplate = (item: Deployment) => /* eslint-disable react/jsx-key */ [
    item.project.name,
    item.version.name,
    item.node.name,
    <span>{item.prefix}</span>,
    <span suppressHydrationWarning>{auditToLocaleDate(item.audit)}</span>,
    <DeploymentStatusTag status={item.status} className="w-fit mx-auto" />,
    <div className="flex justify-center">
      <div className="mr-2 inline-block">
        <DyoIcon
          src="/note.svg"
          alt={t('common:deploy')}
          size="md"
          className={!!item.note && item.note.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'}
          onClick={() => !!item.note && item.note.length > 0 && setShowInfo(item)}
        />
      </div>

      <DyoIcon
        src="/copy.svg"
        alt={t('common:copy')}
        size="md"
        className={
          deploymentIsCopiable(item.status, item.version.type) ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'
        }
        onClick={() => deploymentIsCopiable(item.status, item.version.type) && onCopyDeployment(item.id)}
      />
    </div>,
  ]
  /* eslint-enable react/jsx-key */

  return (
    <Layout title={t('common:deployments')}>
      <PageHeading pageLink={selfLink} />
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
              itemClassName="h-11 min-h-min text-light-eased pl-4 w-fit"
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

      <DyoConfirmationModal config={confirmationModal} className="w-1/4" confirmColor="bg-error-red" />
    </Layout>
  )
}

export default DeploymentsPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const deployments = await getCruxFromContext<Deployment[]>(context, API_DEPLOYMENTS)

  return {
    props: {
      deployments,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
