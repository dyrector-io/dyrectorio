import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import EventsTerminal from '@app/components/shared/events-terminal'
import PageHeading from '@app/components/shared/page-heading'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { NodeDetails } from '@app/models'
import { TeamRoutes } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useEffect, useState } from 'react'

interface ContainerInspectPageProps {
  node: NodeDetails
  prefix: string
  name: string
}

async function fetchContainerInspection(
  teamSlug: string,
  nodeId: string,
  prefix: string,
  name: string,
): Promise<string> {
  const apiUrl = prefix
    ? `/${teamSlug}/nodes/${nodeId}/${prefix}/containers/${name}/inspect`
    : `/${teamSlug}/nodes/${nodeId}/containers/${name}/inspect`

  const response = await fetch(apiUrl)
  if (!response.ok) {
    throw new Error('Failed to fetch container inspection')
  }

  const data = await response.json()
  return data.inspection
}

const NodeContainerInspectPage = (props: ContainerInspectPageProps) => {
  const { node, prefix, name } = props

  const { t } = useTranslation('common')
  const routes = useTeamRoutes()

  const [inspection, setInspection] = useState<string[]>([])
  // const [inspection, setInspection] = useState<ContainerInspection | null>(null)

  const fetchInspection = async () => {
    try {
      // TODO(@amorfevo): remove dummy inspectionData
      // const inspectionData = 'Container ID: 12 Image: my-container-image:latest Status: Running // ... other details ...'
      const teamSlug = routes?.teamSlug
      const inspectionData = await fetchContainerInspection(teamSlug, node.id, prefix, name)
      setInspection([inspectionData])
    } catch (error) {
      console.error('Failed to fetch inspection data:', error)
    }
  }

  useEffect(() => {
    fetchInspection()
  }, [])

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
      <PageHeading pageLink={pageLink} sublinks={sublinks} />

      <DyoCard className="p-4">
        <div className="flex mb-4 justify-between items-start">
          <DyoHeading element="h4" className="text-xl text-bright">
            {t('inspect')}
          </DyoHeading>
        </div>

        {/* TODO(@amorfevo): DyoCards or json-editor component or own inspection component */}
        <EventsTerminal events={inspection} formatEvent={it => [it]} />
      </DyoCard>
    </Layout>
  )
}

export default NodeContainerInspectPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const routes = TeamRoutes.fromContext(context)

  const nodeId = context.query.nodeId as string
  const prefix = context.query.prefix as string
  const name = context.query.name as string

  const node = await getCruxFromContext<NodeDetails>(context, routes.node.api.details(nodeId))

  return {
    props: {
      node,
      prefix: prefix ?? null,
      name: name ?? null,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
