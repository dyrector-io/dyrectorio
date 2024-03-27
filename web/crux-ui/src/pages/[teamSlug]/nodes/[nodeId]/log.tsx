import { Layout } from '@app/components/layout'
import useNodeState from '@app/components/nodes/use-node-state'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import EventsTerminal, { TerminalEvent } from '@app/components/shared/events-terminal'
import PageHeading from '@app/components/shared/page-heading'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import useTeamRoutes from '@app/hooks/use-team-routes'
import useWebSocket from '@app/hooks/use-websocket'
import {
  ContainerLogMessage,
  NodeDetails,
  WatchContainerLogMessage,
  WS_TYPE_CONTAINER_LOG,
  WS_TYPE_WATCH_CONTAINER_LOG,
} from '@app/models'
import { TeamRoutes } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import { GetServerSidePropsContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useEffect, useState } from 'react'

interface InstanceLogPageProps {
  node: NodeDetails
  prefix: string
  name: string
}

const NodeContainerLogPage = (props: InstanceLogPageProps) => {
  const { node: propsNode, prefix, name } = props

  const { t } = useTranslation('common')
  const routes = useTeamRoutes()

  const [log, setLog] = useState<ContainerLogMessage[]>([])

  const [node] = useNodeState(propsNode)

  const sock = useWebSocket(routes.node.detailsSocket(node.id))

  useEffect(() => {
    if (node.status === 'connected') {
      const request: WatchContainerLogMessage = {
        container: {
          prefix,
          name,
        },
      }

      setLog([])
      sock.send(WS_TYPE_WATCH_CONTAINER_LOG, request)
    }
  }, [node.status, prefix, name, sock])

  sock.on(WS_TYPE_CONTAINER_LOG, (message: ContainerLogMessage) => {
    setLog(prevLog => [...prevLog, message])
  })

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
      name: t('log'),
      url: `${routes.node.containerLog(node.id, { prefix, name })}`,
    },
  ]

  const formatEvent = (it: ContainerLogMessage): TerminalEvent[] => [
    {
      content: it.log,
    },
  ]

  return (
    <Layout title={t('image')}>
      <PageHeading pageLink={pageLink} sublinks={sublinks} />

      <DyoCard className="p-4">
        <div className="flex mb-4 justify-between items-start">
          <DyoHeading element="h4" className="text-xl text-bright">
            {t('logOf', { name: prefix ? `${prefix}-${name}` : name })}
          </DyoHeading>
        </div>

        <EventsTerminal events={log} formatEvent={formatEvent} />
      </DyoCard>
    </Layout>
  )
}

export default NodeContainerLogPage

const getPageServerSideProps = async (context: GetServerSidePropsContext) => {
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
