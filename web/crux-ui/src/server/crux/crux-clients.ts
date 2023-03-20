import { invalidArgument } from '@app/error-responses'
import {
  CruxAuditClient,
  CruxDashboardClient,
  CruxDeploymentClient,
  CruxHealthClient,
  CruxImageClient,
  CruxNodeClient,
  CruxNotificationClient,
  CruxProductClient,
  CruxProductVersionClient,
  CruxStorageClient,
  CruxTeamClient,
  CruxTemplateClient,
} from '@app/models/grpc/protobuf/proto/crux'
import { credentials } from '@grpc/grpc-js'

class CruxClients {
  products: CruxProductClient

  nodes: CruxNodeClient

  versions: CruxProductVersionClient

  images: CruxImageClient

  deployments: CruxDeploymentClient

  teams: CruxTeamClient

  health: CruxHealthClient

  audit: CruxAuditClient

  notifications: CruxNotificationClient

  templates: CruxTemplateClient

  dashboard: CruxDashboardClient

  storage: CruxStorageClient

  constructor(address: string) {
    // tls must be terminated by the reverse proxy
    const creds = credentials.createInsecure()

    if (address === undefined || address === '') {
      throw invalidArgument('address', 'address cannot be empty!')
    }

    this.products = new CruxProductClient(address, creds)
    this.nodes = new CruxNodeClient(address, creds)
    this.versions = new CruxProductVersionClient(address, creds)
    this.images = new CruxImageClient(address, creds)
    this.deployments = new CruxDeploymentClient(address, creds)
    this.teams = new CruxTeamClient(address, creds)
    this.health = new CruxHealthClient(address, creds)
    this.audit = new CruxAuditClient(address, creds)
    this.notifications = new CruxNotificationClient(address, creds)
    this.templates = new CruxTemplateClient(address, creds)
    this.dashboard = new CruxDashboardClient(address, creds)
    this.storage = new CruxStorageClient(address, creds)
  }
}

export default CruxClients
