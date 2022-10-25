/* eslint-disable import/no-cycle */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-shadow */
// TODO(Balanceee): refactor
import { WS_DATA_CRUX } from '@app/const'
import { CruxHealth } from '@app/models'
import WsConnection from '@app/websockets/connection'
import { Identity } from '@ory/kratos-client'
import { sessionOf, sessionOfContext } from '@server/kratos'
import registryConnections, {
  CruxRegistryConnectionsServices,
  RegistryConnections,
} from '@server/registry-api/registry-connections'
import { readFileSync } from 'fs'
import { NextApiRequest, NextPageContext } from 'next'
import { join } from 'path'
import { cwd } from 'process'
import DyoAuditService from './audit-service'
import CruxClients from './crux-clients'
import DyoDeploymentService from './deployment-service'
import DyoHealthService from './health-service'
import DyoImageService from './image-service'
import DyoNodeService from './node-service'
import DyoNotifcationService from './notification-service'
import DyoProductService from './product-service'
import DyoRegistryService from './registry-service'
import DyoTeamService from './team-service'
import DyoTemplateService from './template-service'
import DyoVersionService from './version-service'

export class Crux {
  private _products: DyoProductService

  private _registries: DyoRegistryService

  private _nodes: DyoNodeService

  private _versions: DyoVersionService

  private _images: DyoImageService

  private _deployments: DyoDeploymentService

  private _teams: DyoTeamService

  private _health: DyoHealthService

  private _audit: DyoAuditService

  private _notifications: DyoNotifcationService

  private _templates: DyoTemplateService

  private constructor(
    private clients: CruxClients,
    public readonly identity: Identity,
    private registryConnections: RegistryConnections,
  ) {}

  get products() {
    return this._products ?? new DyoProductService(this.clients.products, this.identity)
  }

  get registries() {
    return this._registries ?? new DyoRegistryService(this.clients.registries, this.identity, this.registryConnections)
  }

  get nodes() {
    return this._nodes ?? new DyoNodeService(this.clients.nodes, this.identity)
  }

  get versions() {
    return this._versions ?? new DyoVersionService(this.clients.versions, this.identity)
  }

  get images() {
    return this._images ?? new DyoImageService(this.clients.images, this.identity)
  }

  get deployments() {
    return this._deployments ?? new DyoDeploymentService(this.clients.deployments, this.identity)
  }

  get teams() {
    return this._teams ?? new DyoTeamService(this.clients.teams, this.identity, this.registryConnections)
  }

  get health() {
    return this._health ?? new DyoHealthService(this.clients.health)
  }

  get audit() {
    return this._audit ?? new DyoAuditService(this.clients.audit, this.identity)
  }

  get notificiations() {
    return this._notifications ?? new DyoNotifcationService(this.clients.notifications, this.identity)
  }

  get templates() {
    return this._templates ?? new DyoTemplateService(this.clients.templates, this.identity)
  }

  get registryConnectionsServices(): CruxRegistryConnectionsServices {
    return {
      getIdentity: () => this.identity,
      getRegistryDetails: (id: string) => this.registries.getRegistryDetails(id),
    }
  }

  public static withIdentity(identity: Identity): Crux {
    return new Crux(global.cruxClients, identity, registryConnections)
  }
}

if (!global.cruxClients) {
  try {
    const cert = process.env.CRUX_INSECURE === 'true' ? null : readFileSync(join(cwd(), './certs/api-public.crt'))
    global.cruxClients = new CruxClients(process.env.CRUX_API_ADDRESS, cert)
  } catch (err) {
    if (err.error === 'invalidArgument') {
      throw new Error('CRUX_API_ADDRESS cannot be empty!')
    }

    if (process.env.NEXT_PHASE !== 'phase-production-build') {
      const msg = 'could not load public cert file'
      throw Error(msg)
    }
  }
}

export const getCruxHealth = async (): Promise<CruxHealth> => await Crux.withIdentity(null).health.getHealth()

export const cruxFromContext = (context: NextPageContext): Crux => {
  const session = sessionOfContext(context)
  return Crux.withIdentity(session?.identity)
}

export const cruxFromConnection = (connection: WsConnection): Crux => {
  let crux = connection.data.get(WS_DATA_CRUX) as Crux
  if (!crux) {
    crux = Crux.withIdentity(connection.identity)
    connection.data.set(WS_DATA_CRUX, crux)
  }

  return crux
}

const crux = (req: NextApiRequest): Crux => {
  const session = sessionOf(req)
  return Crux.withIdentity(session?.identity)
}

export default crux
