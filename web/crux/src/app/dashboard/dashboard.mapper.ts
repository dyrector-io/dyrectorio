import { Injectable } from '@nestjs/common'
import { Node } from '@prisma/client'
import { toTimestamp } from 'src/domain/utils'
import { NodeConnectionStatus } from 'src/grpc/protobuf/proto/crux'
import AgentService from '../agent/agent.service'
import { NodeDto } from '../node/node.dto'

@Injectable()
export default class DashboardMapper {
  constructor(private agentService: AgentService) {}

  nodesToProto(nodes: ActiveNode[]): NodeDto[] {
    return nodes.flatMap(it => {
      const agent = this.agentService.getById(it.id)

      if (!agent || agent.getConnectionStatus() !== NodeConnectionStatus.CONNECTED) {
        return []
      }

      return {
        address: agent.address,
        version: agent.version,
        name: it.name,
        id: it.id,
      }
    })
  }

  deploymentsToProto(deployments: LatestDeployment[]): any[] {
    return deployments.map(it => ({
      id: it.id,
      changelog: it.version.changelog,
      product: it.version.product.name,
      node: it.node.name,
      version: it.version.name,
      deployedAt: toTimestamp(it.createdAt),
      productId: it.version.product.id,
      versionId: it.version.id,
    }))
  }
}

type ActiveNode = Pick<Node, 'id' | 'name'>
type LatestDeployment = {
  id: string
  version: {
    id: string
    name: string
    changelog: string
    product: {
      id: string
      name: string
    }
  }
  createdAt: Date
  node: {
    name: string
  }
}
