import { Layout } from '@app/components/layout'
import InspectTableView from '@app/components/nodes/inspect-table-view'
import InspectViewModeToggle, { InspectViewMode } from '@app/components/nodes/inspect-view-mode-toggle'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import JsonEditor from '@app/components/shared/json-editor-dynamic-module'
import PageHeading from '@app/components/shared/page-heading'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { NodeContainerInspection, NodeDetails } from '@app/models'
import { TeamRoutes } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import { GetServerSidePropsContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'

interface ContainerInspectPageProps {
  node: NodeDetails
  prefix: string
  name: string
  inspection: object
}

const NodeContainerInspectPage = ({ node, prefix, name, inspection }: ContainerInspectPageProps) => {
  const { t } = useTranslation('common')
  const routes = useTeamRoutes()
  const [viewMode, setViewMode] = useState<InspectViewMode>('table')

  const pageLink: BreadcrumbLink = {
    name: t('nodes'),
    url: routes.node.list(),
  }

  const sublinks: BreadcrumbLink[] = [
    {
      name: node.name,
      url: `${routes.node.details(node.id)}`,
    },
    {
      name: t('inspect'),
      url: `${routes.node.containerInspect(node.id, { prefix, name })}`,
    },
  ]

  return (
    <Layout title={t('image')}>
      <PageHeading pageLink={pageLink} sublinks={sublinks}>
        <div className="flex flex-row mt-4 justify-end">
          {inspection && <InspectViewModeToggle viewMode={viewMode} onViewModeChanged={setViewMode} />}
        </div>
      </PageHeading>

      <DyoCard className="p-4">
        <div className="flex mb-4 justify-between items-start">
          <DyoHeading element="h4" className="text-xl text-bright">
            {t('inspectOf', { name: prefix ? `${prefix}-${name}` : name })}
          </DyoHeading>
        </div>

        {inspection &&
          (viewMode === 'table' ? (
            <InspectTableView inspect={inspection} />
          ) : (
            <JsonEditor value={inspection} disabled />
          ))}
      </DyoCard>
    </Layout>
  )
}

export default NodeContainerInspectPage

const getPageServerSideProps = async (context: GetServerSidePropsContext) => {
  const routes = TeamRoutes.fromContext(context)

  const nodeId = context.query.nodeId as string
  const prefix = context.query.prefix as string
  const name = context.query.name as string

  const node = await getCruxFromContext<NodeDetails>(context, routes.node.api.details(nodeId))
  const inspectApiUrl = `${routes.node.api.details(nodeId)}/${prefix ? `${prefix}/` : ''}containers/${name}/inspect`
  const res = await getCruxFromContext<NodeContainerInspection>(context, inspectApiUrl)
  const inspection = JSON.parse(res.inspection)

  return {
    props: {
      node,
      prefix: prefix ?? null,
      name: name ?? null,
      inspection,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
