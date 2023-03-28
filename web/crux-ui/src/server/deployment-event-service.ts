import {
  DeploymentEvent,
  DeploymentEventMessage,
  lastDeploymentStatusOfEvents,
  WS_TYPE_DEPLOYMENT_EVENT,
  WS_TYPE_DYO_ERROR,
} from '@app/models'
import { deploymentEventsApiUrl } from '@app/routes'
import { fetchCruxFromRequest } from '@app/utils'
import WsConnection from '@app/websockets/connection'
import WsEndpoint from '@app/websockets/endpoint'
import { cruxFromConnection } from './crux/crux'
import { fromGrpcError, parseGrpcError } from './error-middleware'

class DeploymentEventService {
  private events: DeploymentEvent[] = null

  constructor(private endpoint: WsEndpoint, private deploymentId: string) {}

  get running() {
    return !!this.events
  }

  async fetchEvents(connection: WsConnection): Promise<DeploymentEvent[]> {
    if (this.running) {
      return this.events
    }

    const cruxRes = await fetchCruxFromRequest(connection.request, deploymentEventsApiUrl(this.deploymentId))
    const events = (await cruxRes.json()) as DeploymentEvent[]
    const status = lastDeploymentStatusOfEvents(events)

    if (status !== 'in-progress') {
      return events
    }

    this.events = events

    const crux = cruxFromConnection(connection)
    crux.deployments.subscribeToDeploymentEvents(this.deploymentId, {
      onMessage: message => {
        this.events.push(...message)
        message.forEach(it => this.endpoint.sendAll(WS_TYPE_DEPLOYMENT_EVENT, it as DeploymentEventMessage))
      },
      onError: err => {
        this.events = null
        const error = parseGrpcError(err)
        this.endpoint.sendAll(WS_TYPE_DYO_ERROR, fromGrpcError(error))
      },
      onClose: () => {
        this.events = null
      },
    })

    return this.events
  }
}

export default DeploymentEventService
