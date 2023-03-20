import { invalidArgument } from '@app/error-responses'
import {
  CruxDeploymentClient,
  CruxHealthClient,
  CruxImageClient,
  CruxNodeClient,
  CruxNotificationClient,
  CruxStorageClient,
  CruxTeamClient,
  CruxTemplateClient,
} from '@app/models/grpc/protobuf/proto/crux'
import { credentials } from '@grpc/grpc-js'

class CruxClients {
  products: CruxProductClient

  nodes: CruxNodeClient

  images: CruxImageClient

  deployments: CruxDeploymentClient

  teams: CruxTeamClient

  health: CruxHealthClient

  notifications: CruxNotificationClient

  templates: CruxTemplateClient

  storage: CruxStorageClient

  constructor(address: string) {
    // tls must be terminated by the reverse proxy
    const creds = credentials.createInsecure()

    if (address === undefined || address === '') {
      throw invalidArgument('address', 'address cannot be empty!')
    }

    this.nodes = new CruxNodeClient(address, creds)
    this.images = new CruxImageClient(address, creds)
    this.deployments = new CruxDeploymentClient(address, creds)
    this.teams = new CruxTeamClient(address, creds)
    this.health = new CruxHealthClient(address, creds)
    this.notifications = new CruxNotificationClient(address, creds)
    this.templates = new CruxTemplateClient(address, creds)
    this.storage = new CruxStorageClient(address, creds)
  }
}

export default CruxClients
