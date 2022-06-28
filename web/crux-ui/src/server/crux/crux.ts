import { WS_DATA_CRUX } from '@app/const'
import { ServiceStatus } from '@app/models'
import {
  CruxAuditClient,
  CruxDeploymentClient,
  CruxHealthClient,
  CruxImageClient,
  CruxNodeClient,
  CruxProductClient,
  CruxProductVersionClient,
  CruxRegistryClient,
  CruxTeamClient,
} from '@app/models/grpc/protobuf/proto/crux'
import { WsConnection } from '@app/websockets/server'
import { credentials } from '@grpc/grpc-js'
import { Identity } from '@ory/kratos-client'
import { sessionOf, sessionOfContext } from '@server/kratos'
import registryConnections, { RegistryConnections } from '@server/registry-api/registry-connections'
import { readFileSync } from 'fs'
import { NextApiRequest, NextPageContext } from 'next'
import { join } from 'path'
import { cwd } from 'process'
import DyoAuditService from './audit-service'
import DyoDeploymentService from './deployment-service'
import DyoHealthService from './health-service'
import DyoImageService from './image-service'
import DyoNodeService from './node-service'
import DyoProductService from './product-service'
import DyoRegistryService from './registry-service'
import DyoTeamService from './team-service'
import DyoVersionService from './version-service'

class CruxClients {
  products: CruxProductClient
  registries: CruxRegistryClient
  nodes: CruxNodeClient
  versions: CruxProductVersionClient
  images: CruxImageClient
  deployments: CruxDeploymentClient
  teams: CruxTeamClient
  health: CruxHealthClient
  audit: CruxAuditClient

  constructor(address: string, publicKey: Buffer) {
    const creds = publicKey ? credentials.createSsl(publicKey) : credentials.createInsecure()

    this.products = new CruxProductClient(address, creds)
    this.registries = new CruxRegistryClient(address, creds)
    this.nodes = new CruxNodeClient(address, creds)
    this.versions = new CruxProductVersionClient(address, creds)
    this.images = new CruxImageClient(address, creds)
    this.deployments = new CruxDeploymentClient(address, creds)
    this.teams = new CruxTeamClient(address, creds)
    this.health = new CruxHealthClient(address, creds)
    this.audit = new CruxAuditClient(address, creds)
  }
}

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

  public static withIdentity(identity: Identity): Crux {
    return new Crux(global._cruxClients, identity, registryConnections)
  }
}

if (!global._cruxClients) {
  try {
    const cert = process.env.CRUX_INSECURE === 'true' ? null : readFileSync(join(cwd(), './certs/public.crt'))
    global._cruxClients = new CruxClients(process.env.CRUX_ADDRESS, cert)
  } catch (error) {
    if (process.env.NEXT_PHASE !== 'phase-production-build') {
      const msg = 'could not load public cert file'
      console.error(msg, error)
      throw Error(msg)
    }
  }
}

export const getCruxServiceStatus = async (): Promise<ServiceStatus> =>
  (await Crux.withIdentity(null).health.getHealth()) ? 'operational' : 'unavailable'

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
