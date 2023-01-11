import { Layout } from '@app/components/layout'
import InstanceLogTerminal from '@app/components/products/versions/deployments/instances/instance-log-terminal'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import useWebSocket from '@app/hooks/use-websocket'
import { ContainerLogMessage, DyoNodeDetails, WS_TYPE_CONTAINER_LOG, WS_TYPE_WATCH_CONTAINER_LOG } from '@app/models'
import { nodeContainerLogUrl, nodeUrl, nodeWsUrl, ROUTE_NODES } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { cruxFromContext } from '@server/crux/crux'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'

interface InstanceLogPageProps {
  node: DyoNodeDetails
  dockerId: string
  kubePrefix: string
  kubeName: string
}

const NodeContainerLogPage = (props: InstanceLogPageProps) => {
  const { node, dockerId, kubePrefix, kubeName } = props

  const { t } = useTranslation('common')

  const [log, setLog] = useState<ContainerLogMessage[]>([])

  const sock = useWebSocket(nodeWsUrl(node.id), {
    onOpen: () => {
      const request = dockerId
        ? {
            id: dockerId,
          }
        : {
            prefixName: {
              prefix: kubePrefix,
              name: kubeName,
            },
          }

      sock.send(WS_TYPE_WATCH_CONTAINER_LOG, request)
    },
  })

  sock.on(WS_TYPE_CONTAINER_LOG, (message: ContainerLogMessage) => {
    setLog(prevLog => [...prevLog, message])
  })

  const pageLink: BreadcrumbLink = {
    name: t('nodes'),
    url: ROUTE_NODES,
  }

  const sublinks: BreadcrumbLink[] = [
    {
      name: node.name,
      url: `${nodeUrl(node.id)}`,
    },
    {
      name: t('log'),
      url: `${nodeContainerLogUrl(node.id, dockerId, kubePrefix, kubeName)}`,
    },
  ]

  return (
    <Layout title={t('image')}>
      <PageHeading pageLink={pageLink} sublinks={sublinks} />

      <DyoCard className="p-4">
        <div className="flex mb-4 justify-between items-start">
          <DyoHeading element="h4" className="text-xl text-bright">
            {t('log')}
          </DyoHeading>
        </div>

        <InstanceLogTerminal events={log} />
      </DyoCard>
    </Layout>
  )
}

export default NodeContainerLogPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const { nodeId, dockerId, kubePrefix, kubeName } = context.query

  const node = await cruxFromContext(context).nodes.getNodeDetails(nodeId as string)

  return {
    props: {
      node,
      dockerId: dockerId ?? null,
      kubePrefix: kubePrefix ?? null,
      kubeName: kubeName ?? null,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
