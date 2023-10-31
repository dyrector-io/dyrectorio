import AddDeploymentCard from '@app/components/deployments/add-deployment-card'
import { Layout } from '@app/components/layout'
import CopyDeploymentCard from '@app/components/projects/versions/deployments/copy-deployment-card'
import DeploymentStatusTag from '@app/components/projects/versions/deployments/deployment-status-tag'
import useCopyDeploymentState from '@app/components/projects/versions/deployments/use-copy-deployment-state'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import PageHeading from '@app/components/shared/page-heading'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { chipsQALabelFromValue } from '@app/elements/dyo-chips'
import DyoFilterChips from '@app/elements/dyo-filter-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoIcon from '@app/elements/dyo-icon'
import DyoModal, { DyoConfirmationModal } from '@app/elements/dyo-modal'
import DyoTable, { DyoColumn, sortDate, sortEnum, sortString } from '@app/elements/dyo-table'
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
import { QA_DIALOG_LABEL_DELETE_DEPLOYMENT, QA_MODAL_LABEL_DEPLOYMENT_NOTE } from 'quality-assurance'
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

  const [creating, setCreating] = useState(false)

  const handleApiError = defaultApiErrorHandler(t)

  const [showInfo, setShowInfo] = useState<Deployment>(null)
  const [copyDeploymentTarget, setCopyDeploymentTarget] = useCopyDeploymentState({
    handleApiError,
  })
  const [confirmModalConfig, confirm] = useConfirmation()

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

  const onDeleteDeployment = async (deployment: Deployment) => {
    const confirmed = await confirm({
      qaLabel: QA_DIALOG_LABEL_DELETE_DEPLOYMENT,
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
      await handleApiError(res)
      return
    }

    setDeployments([...deployments.filter(it => it.id !== deployment.id)])
  }

  const onDeploymentCopied = async (deploymentId: string) => {
    await router.push(routes.deployment.details(deploymentId))
  }

  const onRowClick = async (data: Deployment) => await router.push(routes.deployment.details(data.id))

  const onDeploymentCreated = async (deploymentId: string) => await router.push(routes.deployment.details(deploymentId))

  const onCreateDiscard = () => setCreating(false)

  return (
    <Layout title={t('common:deployments')}>
      <PageHeading pageLink={selfLink}>
        {!creating && (
          <DyoButton className="ml-auto px-4" onClick={() => setCreating(true)}>
            {t('common:add')}
          </DyoButton>
        )}
      </PageHeading>

      {creating && <AddDeploymentCard className="mb-4 p-8" onAdd={onDeploymentCreated} onDiscard={onCreateDiscard} />}

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
              name="deploymentStatusFilter"
              choices={DEPLOYMENT_STATUS_VALUES}
              converter={it => t(`common:deploymentStatuses.${it}`)}
              selection={filters.filter?.enum}
              onSelectionChange={type => {
                filters.setFilter({
                  enum: type,
                })
              }}
              qaLabel={chipsQALabelFromValue}
            />
          </Filters>

          <DyoCard className="relative mt-4">
            <DyoTable
              data={filters.filtered}
              dataKey="id"
              onRowClick={onRowClick}
              initialSortColumn={4}
              initialSortDirection="asc"
            >
              <DyoColumn
                header={t('common:project')}
                field="project.name"
                className="w-2/12"
                sortable
                sort={sortString}
              />
              <DyoColumn
                header={t('common:version')}
                field="version.name"
                className="w-2/12"
                sortable
                sort={sortString}
              />
              <DyoColumn header={t('common:node')} field="node.name" className="w-2/12" sortable sort={sortString} />
              <DyoColumn header={t('common:prefix')} field="prefix" className="w-2/12" sortable sort={sortString} />
              <DyoColumn
                header={t('common:updatedAt')}
                className="w-2/12"
                suppressHydrationWarning
                sortable
                sortField={(it: Deployment) => it.audit.updatedAt ?? it.audit.createdAt}
                sort={sortDate}
                body={(it: Deployment) => auditToLocaleDate(it.audit)}
              />
              <DyoColumn
                header={t('common:status')}
                className="w-2/12 text-center"
                sortable
                sortField="status"
                sort={sortEnum(DEPLOYMENT_STATUS_VALUES)}
                body={(it: Deployment) => <DeploymentStatusTag status={it.status} className="w-fit mx-auto" />}
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
                      className={clsx(
                        !!it.note && it.note.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-30',
                        'mr-2',
                      )}
                      onClick={() => !!it.note && it.note.length > 0 && setShowInfo(it)}
                    />

                    <DyoIcon
                      src="/copy.svg"
                      alt={t('common:copy')}
                      size="md"
                      className={clsx(
                        deploymentIsCopiable(it.status) ? 'cursor-pointer' : 'cursor-not-allowed opacity-30',
                        'mr-2',
                      )}
                      onClick={() => deploymentIsCopiable(it.status) && setCopyDeploymentTarget(it.id)}
                    />

                    {deploymentIsDeletable(it.status) ? (
                      <DyoIcon
                        className="aspect-square cursor-pointer"
                        src="/trash-can.svg"
                        alt={t('common:delete')}
                        size="md"
                        onClick={() => onDeleteDeployment(it)}
                      />
                    ) : null}
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
          qaLabel={QA_MODAL_LABEL_DEPLOYMENT_NOTE}
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
