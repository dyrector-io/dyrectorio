import { Layout } from '@app/components/layout'
import InstanceLogTerminal from '@app/components/products/versions/deployments/instances/instance-log-terminal'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import useWebSocket from '@app/hooks/use-websocket'
import { ContainerLogMessage, WS_TYPE_CONTAINER_LOG, WS_TYPE_WATCH_CONTAINER_LOG } from '@app/models'
import { nodeWsUrl, ROUTE_PRODUCTS } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'

interface InstanceLogPageProps {
  nodeId: string
  dockerId: string
  kubePrefix: string
  kubeName: string
}

const InstanceLogPage = (props: InstanceLogPageProps) => {
  const { nodeId, dockerId, kubePrefix, kubeName } = props

  const { t } = useTranslation('nodes')

  const [log, setLog] = useState<ContainerLogMessage[]>([])

  const sock = useWebSocket(nodeWsUrl(nodeId), {
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
    name: t('common:container'),
    url: ROUTE_PRODUCTS,
  }

  const sublinks: BreadcrumbLink[] = []

  return (
    <Layout title={t('common:image')}>
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

export default InstanceLogPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const { nodeId, dockerId, kubePrefix, kubeName } = context.query

  return {
    props: {
      nodeId,
      dockerId: dockerId ?? null,
      kubePrefix: kubePrefix ?? null,
      kubeName: kubeName ?? null,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
