import { Injectable } from '@nestjs/common'
import { Node } from '@prisma/client'
import AgentService from '../agent/agent.service'
import { NodeDto } from '../node/node.dto'
import { DashboardDeploymentDto } from './dashboard.dto'

@Injectable()
export default class DashboardMapper {
  constructor(private agentService: AgentService) {}

  nodesToDto(nodes: ActiveNode[]): NodeDto[] {
    return nodes.flatMap(it => {
      const agent = this.agentService.getById(it.id)

      if (!agent?.connected) {
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

  deploymentsToDto(deployments: LatestDeployment[]): DashboardDeploymentDto[] {
    return deployments.map(it => ({
      id: it.id,
      changelog: it.version.changelog,
      product: it.version.product.name,
      node: it.node.name,
      version: it.version.name,
      deployedAt: it.createdAt,
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
