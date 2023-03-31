/* eslint-disable import/no-cycle */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-shadow */
// TODO(Balanceee): refactor
import { WS_DATA_CRUX } from '@app/const'
import { CruxHealth, RegistryDetailsDto, registryDetailsDtoToUI } from '@app/models'
import { registryApiUrl } from '@app/routes'
import WsConnection from '@app/websockets/connection'
import { Identity } from '@ory/kratos-client'
import { getCruxFromContext } from '@server/crux-api'
import { sessionOf, sessionOfContext } from '@server/kratos'
import registryConnections, {
  CruxRegistryConnectionsServices,
  RegistryConnections,
} from '@server/registry-api/registry-connections'
import { NextApiRequest, NextPageContext } from 'next'
import CruxClients from './crux-clients'
import DyoDeploymentService from './deployment-service'
import DyoHealthService from './health-service'
import DyoNodeService from './node-service'

export class Crux {
  private _nodes: DyoNodeService

  private _deployments: DyoDeploymentService

  private _health: DyoHealthService

  private constructor(
    private clients: CruxClients,
    public readonly identity: Identity,
    public readonly cookie: string,
    private registryConnections: RegistryConnections,
  ) {}

  get nodes() {
    return this._nodes ?? new DyoNodeService(this.clients.nodes)
  }

  get deployments() {
    return this._deployments ?? new DyoDeploymentService(this.clients.deployments, this.cookie)
  }

  get health() {
    return this._health ?? new DyoHealthService(this.clients.health)
  }

  get registryConnectionsServices(): CruxRegistryConnectionsServices {
    return {
      getIdentity: () => this.identity,
      getRegistryDetails: async (id: string) => {
        const dto = await getCruxFromContext<RegistryDetailsDto>(
          {
            req: {
              headers: {
                cookie: this.cookie,
              },
            },
          } as any,
          registryApiUrl(id),
        )

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
