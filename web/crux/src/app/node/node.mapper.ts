import { Injectable } from '@nestjs/common'
import { Node, NodeTypeEnum } from '@prisma/client'
import { AgentEvent } from 'src/domain/agent'
import AgentInstaller from 'src/domain/agent-installer'
import { ContainerState } from 'src/domain/container'
import { fromTimestamp } from 'src/domain/utils'
import {
  ContainerOperation,
  ContainerStateItem,
  ContainerStateListMessage,
  ContainerState as ProtoContainerState,
  containerStateToJSON,
} from 'src/grpc/protobuf/proto/common'
import AgentService from '../agent/agent.service'
import { BasicProperties } from '../../shared/dtos/shared.dto'
import {
  BasicNodeDto,
  BasicNodeWithStatus,
  ContainerDto,
  ContainerOperationDto,
  NodeConnectionStatus,
  NodeDetailsDto,
  NodeDto,
  NodeInstallDto,
  NodeType,
} from './node.dto'
import { ContainersStateListMessage } from './node.message'

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

  toBasicDto(it: Pick<Node, BasicProperties>): BasicNodeDto {
    return {
      id: it.id,
      name: it.name,
      type: it.type,
    }
  }

  toBasicWithStatusDto(it: Pick<Node, BasicProperties>, status: NodeConnectionStatus): BasicNodeWithStatus {
    return {
      id: it.id,
      name: it.name,
      type: it.type,
      status,
    }
  }

  toAgentEvent(node: Node): AgentEvent {
    const agent = this.agentService.getById(node.id)

    return {
      id: node.id,
      address: agent?.address,
      status: agent?.outdated ? 'outdated' : agent?.getConnectionStatus() ?? 'unreachable',
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
      containers:
        list.data?.map(it => ({
          id: it.id,
          imageName: it.imageName,
          imageTag: it.imageTag,
          ports: it.ports,
          state: this.containerStateToDto(it.state),
          reason: it.reason,
          date: fromTimestamp(it.createdAt),
        })) ?? [],
    }
  }

  containerStateItemToDto(it: ContainerStateItem): ContainerDto {
    return {
      id: it.id,
      command: it.command,
      createdAt: fromTimestamp(it.createdAt),
      state: this.containerStateToDto(it.state),
      reason: it.reason,
      status: it.status,
      imageName: it.imageName,
      imageTag: it.imageTag,
      ports:
        it.ports?.map(port => ({
          internal: port.internal,
          external: port.external,
        })) ?? [],
    }
  }

  containerStateToDto(state: ProtoContainerState): ContainerState {
    return containerStateToJSON(state).toLowerCase() as ContainerState
  }

  operationDtoToProto(operation: ContainerOperationDto): ContainerOperation {
    switch (operation) {
      case 'start':
        return ContainerOperation.START_CONTAINER
      case 'stop':
        return ContainerOperation.STOP_CONTAINER
      case 'restart':
        return ContainerOperation.RESTART_CONTAINER
      default:
        return ContainerOperation.UNRECOGNIZED
    }
  }
}
