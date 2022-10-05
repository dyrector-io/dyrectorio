import { invalidArgument } from '@app/error-responses'
import {
  CruxAuditClient,
  CruxDeploymentClient,
  CruxHealthClient,
  CruxImageClient,
  CruxNodeClient,
  CruxNotificationClient,
  CruxProductClient,
  CruxProductVersionClient,
  CruxRegistryClient,
  CruxTeamClient,
  CruxTemplateClient,
} from '@app/models/grpc/protobuf/proto/crux'
import { credentials } from '@grpc/grpc-js'

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

  notifications: CruxNotificationClient

  templates: CruxTemplateClient

  constructor(address: string, publicKey: Buffer) {
    const creds = publicKey ? credentials.createSsl(publicKey) : credentials.createInsecure()

    if (address === undefined || address === '') {
      throw invalidArgument('address', 'address cannot be empty!')
    }

    this.products = new CruxProductClient(address, creds)
    this.registries = new CruxRegistryClient(address, creds)
    this.nodes = new CruxNodeClient(address, creds)
    this.versions = new CruxProductVersionClient(address, creds)
    this.images = new CruxImageClient(address, creds)
    this.deployments = new CruxDeploymentClient(address, creds)
    this.teams = new CruxTeamClient(address, creds)
    this.health = new CruxHealthClient(address, creds)
    this.audit = new CruxAuditClient(address, creds)
    this.notifications = new CruxNotificationClient(address, creds)
    this.templates = new CruxTemplateClient(address, creds)
  }
}

export default CruxClients
