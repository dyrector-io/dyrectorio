import { Layout } from '@app/components/layout'
import DeploymentContainerStatusList from '@app/components/projects/versions/deployments/deployment-container-status-list'
import DeploymentDetailsCard from '@app/components/projects/versions/deployments/deployment-details-card'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import EventsTerminal from '@app/components/shared/events-terminal'
import PageHeading from '@app/components/shared/page-heading'
import DyoButton from '@app/elements/dyo-button'
import useWebSocket from '@app/hooks/use-websocket'
import {
  DeploymentEvent,
  DeploymentEventMessage,
  DeploymentRoot,
  DeploymentStatus,
  WS_TYPE_DEPLOYMENT_EVENT,
  WS_TYPE_DEPLOYMENT_EVENT_LIST,
  WS_TYPE_FETCH_DEPLOYMENT_EVENTS,
} from '@app/models'
import {
  deploymentDeployUrl,
  deploymentUrl,
  deploymentWsUrl,
  nodeInspectUrl,
  projectUrl,
  ROUTE_PROJECTS,
  versionUrl,
} from '@app/routes'
import { terminalDateFormat, withContextAuthorization } from '@app/utils'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useState } from 'react'
import { getDeploymentRoot } from '../[deploymentId]'

interface DeployPageProps {
  deployment: DeploymentRoot
}

const DeployPage = (props: DeployPageProps) => {
  const { deployment: propsDeployment } = props

  const { t } = useTranslation('deployments')

  const router = useRouter()

  const [events, setEvents] = useState<DeploymentEvent[]>([])
  const [status, setStatus] = useState<DeploymentStatus>(propsDeployment.status)

  const deployment = {
    ...propsDeployment,
    status,
  }
  const { project, version } = deployment

  const sock = useWebSocket(deploymentWsUrl(deployment.id), {
    onOpen: () => {
      sock.send(WS_TYPE_FETCH_DEPLOYMENT_EVENTS, {})
    },
  })

  sock.on(WS_TYPE_DEPLOYMENT_EVENT_LIST, (message: DeploymentEventMessage[]) => {
    let newEvents = [...message, ...events]
    newEvents = newEvents.sort((one, other) => new Date(one.createdAt).getTime() - new Date(other.createdAt).getTime())
    setEvents(newEvents)

    const deploymentStatuses = newEvents.filter(it => it.type === 'deployment-status')

    if (deploymentStatuses.length > 0) {
      setStatus(deploymentStatuses[deploymentStatuses.length - 1].deploymentStatus)
    }
  })
  sock.on(WS_TYPE_DEPLOYMENT_EVENT, (message: DeploymentEventMessage) => {
    const newEvents = [...events, message]
    setEvents(newEvents)

    if (message.type === 'deployment-status') {
      setStatus(message.deploymentStatus)
    }
  })

  const pageLink: BreadcrumbLink = {
    name: t('common:deployments'),
    url: ROUTE_PROJECTS,
  }

  const sublinks: BreadcrumbLink[] = [
    {
      name: project.name,
      url: projectUrl(project.id),
    },
    {
      name: version.name,
      url: versionUrl(project.id, version.id),
    },
    {
      name: t('common:deployment'),
      url: deploymentUrl(deployment.id),
    },
    {
      name: t('common:deploy'),
      url: deploymentDeployUrl(deployment.id),
    },
  ]

  const onBack = () => router.back()

  const formatEvent = (event: DeploymentEvent): string[] => {
    if (event.type !== 'log') {
      return []
    }

    const date = new Date(event.createdAt)
    const value = event.log as string[]
    return value?.map(it => `${terminalDateFormat(date)}\xa0\xa0\xa0\xa0${it}`) ?? []
  }

  return (
    <Layout
      title={t('deploysNameDeploy', {
        project: project.name,
        version: version.name,
        name: deployment.node.name,
      })}
    >
      <PageHeading pageLink={pageLink} sublinks={sublinks}>
        <DyoButton className="px-6 ml-auto" href={nodeInspectUrl(deployment.node.id, deployment.prefix)}>
          {t('common:inspect')}
        </DyoButton>

        <DyoButton className="px-6 ml-4" onClick={onBack}>
          {t('common:back')}
        </DyoButton>
      </PageHeading>

      <DeploymentDetailsCard className="flex flex-grow p-6" deployment={deployment}>
        <DeploymentContainerStatusList deployment={propsDeployment} />
        <EventsTerminal events={events} formatEvent={formatEvent} />
      </DeploymentDetailsCard>
    </Layout>
  )
}

export default DeployPage

const getPageServerSideProps = async (context: NextPageContext) => ({
  props: {
    deployment: await getDeploymentRoot(context),
  },
})

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
