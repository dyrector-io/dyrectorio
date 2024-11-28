import ConfigBundleCard from '@app/components/config-bundles/config-bundle-card'
import EditConfigBundleCard from '@app/components/config-bundles/edit-config-bundle-card'
import DeploymentStatusTag from '@app/components/deployments/deployment-status-tag'
import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu } from '@app/components/shared/page-menu'
import { PaginationSettings } from '@app/components/shared/paginator'
import { DyoCard } from '@app/elements/dyo-card'
import DyoIcon from '@app/elements/dyo-icon'
import DyoLink from '@app/elements/dyo-link'
import DyoTable, { DyoColumn, sortDate, sortEnum, sortString } from '@app/elements/dyo-table'
import { defaultApiErrorHandler } from '@app/errors'
import useSubmit from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { ConfigBundleDetails, Deployment, DEPLOYMENT_STATUS_VALUES, DeploymentList, DeploymentQuery, detailsToConfigBundle } from '@app/models'
import { TeamRoutes } from '@app/routes'
import { auditToLocaleDate, withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import { GetServerSidePropsContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const defaultPagination: PaginationSettings = { pageNumber: 0, pageSize: 10 }

type ConfigBundleDetailsPageProps = {
  configBundle: ConfigBundleDetails
}

const ConfigBundleDetailsPage = (props: ConfigBundleDetailsPageProps) => {
  const { configBundle: propsConfigBundle } = props

  const { t } = useTranslation('config-bundles')
  const router = useRouter()
  const routes = useTeamRoutes()

  const onApiError = defaultApiErrorHandler(t)

  const [configBundle, setConfigBundle] = useState<ConfigBundleDetails>(propsConfigBundle)
  const [editing, setEditing] = useState(false)

  const submit = useSubmit()

  const [pagination, setPagination] = useState<PaginationSettings>(defaultPagination)

  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [total, setTotal] = useState<number>(0)

  const onDelete = async () => {
    const res = await fetch(routes.configBundle.api.details(configBundle.id), {
      method: 'DELETE',
    })

    if (res.ok) {
      await router.replace(routes.configBundle.list())
    } else {
      await onApiError(res)
    }
  }

  
  const fetchData = async () => {
    const query: DeploymentQuery = {
      skip: pagination.pageNumber * pagination.pageSize,
      take: pagination.pageSize,
      configBundleId: propsConfigBundle.id,
    }

    const res = await fetch(routes.deployment.api.list(query))

    if (res.ok) {
      const list = (await res.json()) as DeploymentList
      setDeployments(list.items)
      setTotal(list.total)
    } else {
      setDeployments([])
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination])

  const pageLink: BreadcrumbLink = {
    name: t('common:configBundles'),
    url: routes.configBundle.list(),
  }

  return (
    <Layout title={t('configBundleName', configBundle)}>
      <PageHeading
        pageLink={pageLink}
        sublinks={[
          {
            name: configBundle.name,
            url: routes.configBundle.details(configBundle.id),
          },
        ]}
      >
        <DetailsPageMenu
          submit={submit}
          onDelete={onDelete}
          editing={editing}
          setEditing={setEditing}
          deleteModalTitle={t('common:areYouSureDeleteName', { name: configBundle.name })}
          deleteModalDescription={t('common:proceedYouLoseAllDataToName', {
            name: configBundle.name,
          })}
        />
      </PageHeading>
      {editing ? (
        <EditConfigBundleCard submit={submit} configBundle={configBundle} onConfigBundleEdited={setConfigBundle} />
      ) : (
        <ConfigBundleCard configBundle={detailsToConfigBundle(configBundle)} />
      )}
      <DyoCard className="relative mt-4">
        <DyoTable
          data={deployments}
          dataKey="id"
          pagination="server"
          paginationTotal={total}
          onServerPagination={setPagination}
          initialSortColumn={4}
          initialSortDirection="desc"
        >
          <DyoColumn header={t('common:project')} field="project.name" className="w-2/12" sortable sort={sortString} />
          <DyoColumn header={t('common:version')} field="version.name" className="w-2/12" sortable sort={sortString} />
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
              <DyoLink
                className="inline-block mr-2"
                href={routes.deployment.details(it.id)}
                qaLabel="deployment-list-view-icon"
              >
                <DyoIcon src="/eye.svg" alt={t('common:view')} size="md" />
              </DyoLink>
            )}
          />
        </DyoTable>
      </DyoCard>
    </Layout>
  )
}

export default ConfigBundleDetailsPage

const getPageServerSideProps = async (context: GetServerSidePropsContext) => {
  const routes = TeamRoutes.fromContext(context)

  const configBundleId = context.query.configBundleId as string

  const configBundle = await getCruxFromContext<ConfigBundleDetails>(
    context,
    routes.configBundle.api.details(configBundleId),
  )

  return {
    props: {
      configBundle,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
