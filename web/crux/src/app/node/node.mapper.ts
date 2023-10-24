import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { Node, NodeTypeEnum } from '@prisma/client'
import { AgentConnectionMessage } from 'src/domain/agent'
import AgentInstaller from 'src/domain/agent-installer'
import { ContainerState } from 'src/domain/container'
import { NodeWithToken } from 'src/domain/node'
import { fromTimestamp } from 'src/domain/utils'
import {
  ContainerInspectMessage,
  ContainerOperation,
  ContainerStateItem,
  ContainerStateListMessage,
  ContainerState as ProtoContainerState,
  containerStateToJSON,
} from 'src/grpc/protobuf/proto/common'
import { BasicProperties } from '../../shared/dtos/shared.dto'
import AgentService from '../agent/agent.service'
import {
  BasicNodeDto,
  BasicNodeWithStatus,
  ContainerDto,
  ContainerInspectionDto,
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
  constructor(@Inject(forwardRef(() => AgentService)) private agentService: AgentService) {}

  toDto(node: Node): NodeDto {
    return {
      id: node.id,
      name: node.name,
      description: node.description,
      icon: node.icon,
      type: node.type,
      ...this.toConnectionMessage(node),
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

  toConnectionMessage(node: Node): AgentConnectionMessage {
    const agent = this.agentService.getById(node.id)

    return {
      id: node.id,
      address: agent?.address,
      status: agent?.getConnectionStatus() ?? 'unreachable',
      connectedAt: node.connectedAt ?? null,
      version: agent?.version,
    }
  }

  detailsToDto(node: NodeDetails): NodeDetailsDto {
    const installer = this.agentService.getInstallerByNodeId(node.id)

    const agent = this.agentService.getById(node.id)

    return {
      ...this.toDto(node),
      hasToken: !!node.token,
      install: installer ? this.installerToDto(installer) : null,
      updatable: agent && (agent.outdated || !this.agentService.agentVersionIsUpToDate(agent.version)),
      inUse: node._count.deployments > 0,
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
      containers: list.data?.map(it => this.containerStateItemToDto(it)) ?? [],
    }
  }

  containerStateItemToDto(it: ContainerStateItem): ContainerDto {
    return {
      id: it.id,
      command: it.command,
      createdAt: fromTimestamp(it.createdAt),
      state: this.containerStateToDto(it.state),
      reason: it.reason,
      imageName: it.imageName,
      imageTag: it.imageTag,
      ports:
        it.ports?.map(port => ({
          internal: port.internal,
          external: port.external,
        })) ?? [],
      labels: it.labels ?? {},
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

  containerInspectionMessageToDto(it: ContainerInspectMessage): ContainerInspectionDto {
    return {
      inspection: it.inspection,
    }
  }
}

type NodeDetails = NodeWithToken & {
  _count: {
    deployments: number
  }
}
