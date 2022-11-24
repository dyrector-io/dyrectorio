import { DeploymentEvent, DeploymentEventMessage, WS_TYPE_DEPLOYMENT_EVENT, WS_TYPE_DYO_ERROR } from '@app/models'
import WsEndpoint from '@app/websockets/endpoint'
import { Crux } from './crux/crux'
import { fromGrpcError, parseGrpcError } from './error-middleware'

class DeploymentEventService {
  private events: DeploymentEvent[] = null

  constructor(private endpoint: WsEndpoint, private deploymentId: string) {}

  get running() {
    return !!this.events
  }

  async fetchEvents(crux: Crux): Promise<DeploymentEvent[]> {
    if (this.running) {
      return this.events
    }

    const [status, events] = await crux.deployments.getEvents(this.deploymentId)

    if (status !== 'in_progress') {
      return events
    }

    this.events = events
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
