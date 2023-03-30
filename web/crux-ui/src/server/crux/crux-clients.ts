import { invalidArgument } from '@app/error-responses'
import { CruxDeploymentClient, CruxHealthClient, CruxNodeClient } from '@app/models/grpc/protobuf/proto/crux'
import { credentials } from '@grpc/grpc-js'

class CruxClients {
  nodes: CruxNodeClient

  deployments: CruxDeploymentClient

  health: CruxHealthClient

  constructor(address: string) {
    // tls must be terminated by the reverse proxy
    const creds = credentials.createInsecure()

    if (!address || address === '') {
      throw invalidArgument('address', 'address cannot be empty!')
    }

    this.nodes = new CruxNodeClient(address, creds)
    this.deployments = new CruxDeploymentClient(address, creds)
    this.health = new CruxHealthClient(address, creds)
  }
}

export default CruxClients
