import { Injectable } from '@nestjs/common'
import { Node, NodeTypeEnum } from '@prisma/client'
import { AgentEvent } from 'src/domain/agent'
import AgentInstaller from 'src/domain/agent-installer'
import { fromTimestamp } from 'src/domain/utils'
import {
  ContainerStateListMessage,
  ContainerState as ProtoContainerState,
  containerStateToJSON,
} from 'src/grpc/protobuf/proto/common'
import AgentService from '../agent/agent.service'
import { NodeType } from '../shared/shared.dto'
import { NodeDetailsDto, NodeDto, NodeInstallDto } from './node.dto'
import { ContainersStateListMessage, ContainerStateDto } from './node.message'

@Injectable()
export default class NodeMapper {
  constructor(private agentService: AgentService) {}

  toDto(node: Node): NodeDto {
    return {
      id: node.id,
      name: node.name,
      description: node.description,
      icon: node.icon,
      type: node.type,
      ...this.toAgentEvent(node),
    }
  }

  toAgentEvent(node: Node): AgentEvent {
    const agent = this.agentService.getById(node.id)

    return {
      id: node.id,
      address: agent?.address,
      status: agent?.getConnectionStatus() ?? 'unreachable',
      connectedAt: node.connectedAt ?? null,
      version: agent?.version,
      updating: agent?.updating,
    }
  }

  detailsToDto(node: Node): NodeDetailsDto {
    const installer = this.agentService.getInstallerByNodeId(node.id)

    return {
      ...this.toDto(node),
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

  containerStateMessageToContainerMessage(list: ContainerStateListMessage): ContainersStateListMessage {
    return {
      prefix: list.prefix ?? '',
      containers: list.data.map(it => ({
        id: it.id,
        imageName: it.imageName,
        imageTag: it.imageTag,
        ports: it.ports,
        state: this.containerStateToDto(it.state),
        date: fromTimestamp(it.createdAt).toUTCString(),
      })),
    }
  }

  containerStateToDto(state: ProtoContainerState): ContainerStateDto {
    return containerStateToJSON(state).toLowerCase() as ContainerStateDto
  }
}
