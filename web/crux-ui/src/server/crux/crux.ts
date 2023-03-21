/* eslint-disable import/no-cycle */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-shadow */
// TODO(Balanceee): refactor
import { WS_DATA_CRUX } from '@app/const'
import { CruxHealth, RegistryDetailsDto, registryDetailsDtoToUI } from '@app/models'
import { registryApiUrl } from '@app/routes'
import { fetchCrux } from '@app/utils'
import WsConnection from '@app/websockets/connection'
import { Identity } from '@ory/kratos-client'
import { sessionOf, sessionOfContext } from '@server/kratos'
import registryConnections, {
  CruxRegistryConnectionsServices,
  RegistryConnections,
} from '@server/registry-api/registry-connections'
import { NextApiRequest, NextPageContext } from 'next'
import CruxClients from './crux-clients'
import DyoDeploymentService from './deployment-service'
import DyoHealthService from './health-service'
import DyoImageService from './image-service'
import DyoNodeService from './node-service'
import DyoNotifcationService from './notification-service'
import DyoStorageService from './storage-service'
import DyoTeamService from './team-service'
import DyoTemplateService from './template-service'

export class Crux {
  private _nodes: DyoNodeService

  private _images: DyoImageService

  private _deployments: DyoDeploymentService

  private _teams: DyoTeamService

  private _health: DyoHealthService

  private _notifications: DyoNotifcationService

  private _templates: DyoTemplateService

  private _storage: DyoStorageService

  private constructor(
    private clients: CruxClients,
    public readonly identity: Identity,
    public readonly cookie: string,
    private registryConnections: RegistryConnections,
  ) {}

  get nodes() {
    return this._nodes ?? new DyoNodeService(this.clients.nodes, this.cookie)
  }

  get images() {
    return this._images ?? new DyoImageService(this.clients.images, this.cookie)
  }

  get deployments() {
    return this._deployments ?? new DyoDeploymentService(this.clients.deployments, this.cookie)
  }

  get teams() {
    return this._teams ?? new DyoTeamService(this.clients.teams, this.identity, this.registryConnections, this.cookie)
  }

  get health() {
    return this._health ?? new DyoHealthService(this.clients.health)
  }

  get notificiations() {
    return this._notifications ?? new DyoNotifcationService(this.clients.notifications, this.cookie)
  }

  get templates() {
    return this._templates ?? new DyoTemplateService(this.clients.templates, this.cookie)
  }

  get storage() {
    return this._storage ?? new DyoStorageService(this.clients.storage, this.cookie)
  }

  get registryConnectionsServices(): CruxRegistryConnectionsServices {
    return {
      getIdentity: () => this.identity,
      getRegistryDetails: async (id: string) => {
        const res = await fetchCrux(
          {
            req: {
              headers: {
                cookie: this.cookie,
              },
            },
          } as any,
          registryApiUrl(id),
        )
        const dto = (await res.json()) as RegistryDetailsDto
        return registryDetailsDtoToUI(dto)
      },
    }
  }

  public static withIdentity(identity: Identity, cookie: string): Crux {
    return new Crux(global.cruxClients, identity, cookie, registryConnections)
  }
}

if (!global.cruxClients) {
  try {
    global.cruxClients = new CruxClients(process.env.CRUX_API_ADDRESS)
  } catch (err) {
    if (process.env.NEXT_PHASE !== 'phase-production-build') {
      if (err.error === 'invalidArgument') {
        throw new Error('CRUX_API_ADDRESS cannot be empty!')
      }

      throw err
    }
  }
}

export const getCruxHealth = async (): Promise<CruxHealth> => await Crux.withIdentity(null, null).health.getHealth()

export const cruxFromContext = (context: NextPageContext): Crux => {
  const { req } = context
  const { headers } = req
  const { cookie } = headers
  const session = sessionOfContext(context)
  return Crux.withIdentity(session?.identity, cookie)
}

export const cruxFromConnection = (connection: WsConnection): Crux => {
  let crux = connection.data.get(WS_DATA_CRUX) as Crux
  if (!crux) {
    crux = Crux.withIdentity(connection.identity, connection.cookie)
    connection.data.set(WS_DATA_CRUX, crux)
  }

  return crux
}

const crux = (req: NextApiRequest): Crux => {
  const { headers } = req
  const { cookie } = headers
  const session = sessionOf(req)
  return Crux.withIdentity(session?.identity, cookie)
}

export default crux
