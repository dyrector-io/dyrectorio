import { Injectable } from '@nestjs/common'
import { Node } from '@prisma/client'
import { AgentInstaller } from 'src/domain/agent-installer'
import { toTimestamp } from 'src/domain/utils'
import {
  AuditResponse,
  NodeConnectionStatus,
  NodeDetailsResponse,
  NodeInstallResponse,
  NodeResponse,
  NodeScriptResponse,
  NodeType,
} from 'src/grpc/protobuf/proto/crux'
import { AgentService } from '../agent/agent.service'

@Injectable()
export class NodeMapper {
  constructor(private agentService: AgentService) {}

  toGrpc(node: Node): NodeResponse {
    const agent = this.agentService.getById(node.id)

    const status = agent?.getConnectionStatus() ?? NodeConnectionStatus.UNREACHABLE
    return {
      ...node,
      audit: AuditResponse.fromJSON(node),
      address: agent?.address,
      version: agent?.version,
      status,
      connectedAt: node.connectedAt ? toTimestamp(node.connectedAt) : null,
      type: node.type === 'dagent' ? NodeType.DOCKER_NODE : NodeType.K8S_NODE,
    }
  }

  detailsToGrpc(node: Node): NodeDetailsResponse {
    const installer = this.agentService.getInstallerByNodeId(node.id)

    return {
      ...this.toGrpc(node),
      hasToken: !!node.token,
      install: installer ? this.installerToGrpc(installer) : null,
      script: installer ? this.scriptToGrpc(node, installer) : null,
    }
  }

  installerToGrpc(installer: AgentInstaller): NodeInstallResponse {
    return {
      command: installer.getCommand(),
      expireAt: toTimestamp(new Date(installer.expireAt)),
    }
  }

  scriptToGrpc(node: Node, installer: AgentInstaller): NodeScriptResponse {
    return {
      content: installer.getScript(node.name),
    }
  }
}
