import { Injectable } from '@nestjs/common'
import { Node, NodeTypeEnum } from '@prisma/client'
import AgentInstaller from 'src/domain/agent-installer'
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
import AgentService from '../agent/agent.service'

@Injectable()
export default class NodeMapper {
  constructor(private agentService: AgentService) {}

  listItemToProto(node: Node): NodeResponse {
    const agent = this.agentService.getById(node.id)

    const status = agent?.getConnectionStatus() ?? NodeConnectionStatus.UNREACHABLE
    return {
      ...node,
      audit: AuditResponse.fromJSON(node),
      address: agent?.address,
      version: agent?.version,
      status,
      connectedAt: node.connectedAt ? toTimestamp(node.connectedAt) : null,
      type: node.type === NodeTypeEnum.docker ? NodeType.DOCKER : NodeType.K8S,
    }
  }

  detailsToProto(node: Node): NodeDetailsResponse {
    const installer = this.agentService.getInstallerByNodeId(node.id)

    return {
      ...this.listItemToProto(node),
      hasToken: !!node.token,
      install: installer ? this.installerToProto(installer) : null,
      script: installer ? this.scriptToProto(node, installer) : null,
    }
  }

  nodeTypeToDb(type: NodeType): NodeTypeEnum {
    return type === NodeType.DOCKER ? NodeTypeEnum.docker : NodeTypeEnum.k8s
  }

  installerToProto(installer: AgentInstaller): NodeInstallResponse {
    return {
      command: installer.getCommand(),
      expireAt: toTimestamp(new Date(installer.expireAt)),
    }
  }

  scriptToProto(node: Node, installer: AgentInstaller): NodeScriptResponse {
    return {
      content: installer.getScript(node.name),
    }
  }
}
