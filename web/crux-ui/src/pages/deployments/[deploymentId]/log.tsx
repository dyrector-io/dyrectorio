import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import EventsTerminal from '@app/components/shared/events-terminal'
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
import {
  deploymentDeployUrl,
  deploymentLogUrl,
  deploymentUrl,
  nodeWsUrl,
  projectUrl,
  ROUTE_DEPLOYMENTS,
  versionUrl,
} from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'
import { getDeploymentRoot } from '../[deploymentId]'

interface InstanceLogPageProps {
  deployment: DeploymentRoot
}

const DeploymentContainerLogPage = (props: InstanceLogPageProps) => {
  const { deployment } = props
  const { prefix } = deployment

  const { t } = useTranslation('common')

  const [log, setLog] = useState<ContainerLogMessage[]>([])

  const sock = useWebSocket(nodeWsUrl(deployment.node.id), {
    onOpen: () => {
      const request: WatchContainerLogMessage = {
        container: {
          prefix,
          name: null,
        },
      }

      sock.send(WS_TYPE_WATCH_CONTAINER_LOG, request)
    },
  })

  sock.on(WS_TYPE_CONTAINER_LOG, (message: ContainerLogMessage) => {
    setLog(prevLog => [...prevLog, message])
  })

  const pageLink: BreadcrumbLink = {
    name: t('deployments'),
    url: ROUTE_DEPLOYMENTS,
  }

  const sublinks: BreadcrumbLink[] = [
    {
      name: deployment.project.name,
      url: projectUrl(deployment.project.id),
    },
    {
      name: deployment.version.name,
      url: versionUrl(deployment.project.id, deployment.version.id),
    },
    {
      name: t('deployment'),
      url: deploymentUrl(deployment.id),
    },
    {
      name: t('deploy'),
      url: deploymentDeployUrl(deployment.id),
    },
    {
      name: t('log'),
      url: deploymentLogUrl(deployment.id),
    },
  ]

  return (
    <Layout title={t('common:image')}>
      <PageHeading pageLink={pageLink} sublinks={sublinks} />

      <DyoCard className="p-4">
        <div className="flex mb-4 justify-between items-start">
          <DyoHeading element="h4" className="text-xl text-bright">
            {t('log')}
          </DyoHeading>
        </div>

        <EventsTerminal events={log} formatEvent={it => [it.log]} />
      </DyoCard>
    </Layout>
  )
}

export default DeploymentContainerLogPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const deployment = await getDeploymentRoot(context)

  return {
    props: {
      deployment,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
