import { Layout } from '@app/components/layout'
import InstanceLogTerminal from '@app/components/products/versions/deployments/instances/instance-log-terminal'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import useWebSocket from '@app/hooks/use-websocket'
import {
  ContainerLogMessage,
  DeploymentRoot,
  WatchContainerLogMessage,
  WS_TYPE_CONTAINER_LOG,
  WS_TYPE_WATCH_CONTAINER_LOG,
} from '@app/models'
import { nodeWsUrl, ROUTE_PRODUCTS } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { cruxFromContext } from '@server/crux/crux'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'
import { getDeploymentRoot } from '../../../[deploymentId]'

interface InstanceLogPageProps {
  deployment: DeploymentRoot
  instanceId: string
}

const InstanceLogPage = (props: InstanceLogPageProps) => {
  const { deployment, instanceId } = props
  const instance = deployment.instances.find(it => it.id === instanceId)

  const { t } = useTranslation('deployments')

  const [log, setLog] = useState<ContainerLogMessage[]>([])

  const sock = useWebSocket(nodeWsUrl(deployment.nodeId), {
    onOpen: () =>
      sock.send(WS_TYPE_WATCH_CONTAINER_LOG, {
        prefix: deployment.prefix,
        name: instance.image.name,
      } as WatchContainerLogMessage),
  })

  sock.on(WS_TYPE_CONTAINER_LOG, (message: ContainerLogMessage) => {
    setLog(prevLog => [ ...prevLog, message ])
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
            {instance.image.name}
          </DyoHeading>
        </div>

        <InstanceLogTerminal events={log} />
      </DyoCard>
    </Layout>
  )
}

export default InstanceLogPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const { instanceId } = context.query

  const crux = cruxFromContext(context)
  const deployment = await getDeploymentRoot(context, crux)

  return {
    props: {
      deployment,
      instanceId,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
