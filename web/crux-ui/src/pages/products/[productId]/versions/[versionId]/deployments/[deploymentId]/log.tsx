import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import EventsTerminal from '@app/components/shared/events-terminal'
import PageHeading from '@app/components/shared/page-heading'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import useWebSocket from '@app/hooks/use-websocket'
import { ContainerLogMessage, DeploymentRoot, WS_TYPE_CONTAINER_LOG, WS_TYPE_WATCH_CONTAINER_LOG } from '@app/models'
import {
  deploymentContainerLogUrl,
  deploymentDeployUrl,
  deploymentUrl,
  nodeWsUrl,
  productUrl,
  ROUTE_DEPLOYMENTS,
  versionUrl,
} from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { cruxFromContext } from '@server/crux/crux'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'
import { getDeploymentRoot } from '../[deploymentId]'

interface InstanceLogPageProps {
  deployment: DeploymentRoot
  dockerId: string
  prefix: string
  name: string
}

const DeploymentContainerLogPage = (props: InstanceLogPageProps) => {
  const { deployment, dockerId, prefix, name } = props

  const { t } = useTranslation('common')

  const [log, setLog] = useState<ContainerLogMessage[]>([])

  const sock = useWebSocket(nodeWsUrl(deployment.nodeId), {
    onOpen: () => {
      const request = dockerId
        ? {
            id: dockerId,
          }
        : {
            prefixName: {
              prefix,
              name,
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
      name: deployment.product.name,
      url: productUrl(deployment.product.id),
    },
    {
      name: deployment.version.name,
      url: versionUrl(deployment.product.id, deployment.versionId),
    },
    {
      name: t('deployment'),
      url: deploymentUrl(deployment.product.id, deployment.versionId, deployment.id),
    },
    {
      name: t('deploy'),
      url: deploymentDeployUrl(deployment.product.id, deployment.versionId, deployment.id),
    },
    {
      name: t('log'),
      url: deploymentContainerLogUrl(deployment.product.id, deployment.versionId, deployment.id, {
        dockerId,
        prefix,
        name,
      }),
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
  const { dockerId, prefix, name } = context.query

  const crux = cruxFromContext(context)
  const deployment = await getDeploymentRoot(context, crux)

  return {
    props: {
      deployment,
      dockerId: dockerId ?? null,
      prefix: prefix ?? null,
      name: name ?? null,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
