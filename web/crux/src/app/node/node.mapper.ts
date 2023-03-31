import { Injectable } from '@nestjs/common'
import { Node, NodeTypeEnum } from '@prisma/client'
import AgentInstaller from 'src/domain/agent-installer'
import { InvalidArgumentException } from 'src/exception/errors'
import { NodeConnectionStatus as ProtoNodeConnectionStatus } from 'src/grpc/protobuf/proto/crux'
import AgentService from '../agent/agent.service'
import { NodeConnectionStatus, NodeType } from '../shared/shared.dto'
import { NodeDetailsDto, NodeDto, NodeInstallDto } from './node.dto'

@Injectable()
export default class NodeMapper {
  constructor(private agentService: AgentService) {}

  nodeStatusToDto(status: ProtoNodeConnectionStatus): NodeConnectionStatus {
    switch (status) {
      case ProtoNodeConnectionStatus.CONNECTED:
        return 'connected'
      case ProtoNodeConnectionStatus.UNREACHABLE:
        return 'unreachable'
      default:
        throw new InvalidArgumentException({
          message: 'Invalid NodeConnectionStatus',
          property: 'status',
          value: status,
        })
    }
  }

  listItemToDto(node: Node): NodeDto {
    const agent = this.agentService.getById(node.id)

    const status = agent?.getConnectionStatus() ?? ProtoNodeConnectionStatus.UNREACHABLE
    return {
      id: node.id,
      name: node.name,
      description: node.description,
      icon: node.icon,
      address: agent?.address,
      status: this.nodeStatusToDto(status),
      connectedAt: node.connectedAt ?? null,
      version: agent?.version,
      type: node.type,
      updating: agent?.updating,
    }
  }

  detailsToDto(node: Node): NodeDetailsDto {
    const installer = this.agentService.getInstallerByNodeId(node.id)

    return {
      ...this.listItemToDto(node),
      hasToken: !!node.token,
      install: installer ? this.installerToDto(installer) : null,
    }
  }

  nodeTypeToDb(type: NodeType): NodeTypeEnum {
    return type === 'docker' ? NodeTypeEnum.docker : NodeTypeEnum.k8s
  }

  installerToDto(installer: AgentInstaller): NodeInstallDto {
    return {
      command: installer.getCommand(),
      script: installer.getScript(),
      expireAt: installer.expireAt,
    }
  }
}
