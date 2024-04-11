import { Layout } from '@app/components/layout'
import useNodeState from '@app/components/nodes/use-node-state'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import EventsTerminal, { TerminalEvent } from '@app/components/shared/events-terminal'
import PageHeading from '@app/components/shared/page-heading'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoSelect from '@app/elements/dyo-select'
import useTeamRoutes from '@app/hooks/use-team-routes'
import useWebSocket from '@app/hooks/use-websocket'
import {
  ContainerLogMessage,
  ContainerLogStartedMessage,
  NodeDetails,
  SetContainerLogTakeMessage,
  WS_TYPE_CONTAINER_LOG,
  WS_TYPE_CONTAINER_LOG_STARTED,
  WS_TYPE_SET_CONTAINER_LOG_TAKE,
  WS_TYPE_WATCH_CONTAINER_LOG,
  WatchContainerLogMessage,
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

const LOG_TAKE_VALUES = [50, 100, 500, 1000]

const NodeContainerLogPage = (props: InstanceLogPageProps) => {
  const { node: propsNode, prefix, name } = props

  const container = {
    prefix,
    name,
  }

  const { t } = useTranslation('common')
  const routes = useTeamRoutes()

  const [takeIndex, setTakeIndex] = useState<number>(0)
  const [log, setLog] = useState<ContainerLogMessage[]>([])

  const [node] = useNodeState(propsNode)

  const sock = useWebSocket(routes.node.detailsSocket(node.id))

  useEffect(() => {
    if (node.status === 'connected') {
      sock.send(WS_TYPE_WATCH_CONTAINER_LOG, {
        container,
        take: LOG_TAKE_VALUES[takeIndex],
      } as WatchContainerLogMessage)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node.status])

  sock.on(WS_TYPE_CONTAINER_LOG_STARTED, (message: ContainerLogStartedMessage) => {
    const index = LOG_TAKE_VALUES.indexOf(message.take)

    if (index < 0) {
      return
    }

    setLog([])
    setTakeIndex(index)
  })

  sock.on(WS_TYPE_CONTAINER_LOG, (message: ContainerLogMessage) => {
    setLog(messages => [...messages, message])
  })

  const onTakeIndexChange = (index: number) => {
    if (index === takeIndex) {
      return
    }

    setTakeIndex(index)

    if (node.status === 'connected') {
      const request: SetContainerLogTakeMessage = {
        container,
        take: LOG_TAKE_VALUES[index],
      }

      setLog([])
      sock.send(WS_TYPE_SET_CONTAINER_LOG_TAKE, request)
    }
  }

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

          <DyoSelect
            options={LOG_TAKE_VALUES.map(it => it.toString())}
            selected={takeIndex}
            onChange={onTakeIndexChange}
          />
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
