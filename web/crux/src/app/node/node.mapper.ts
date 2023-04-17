import { BadRequestException, Injectable } from '@nestjs/common'
import { Node, NodeTypeEnum } from '@prisma/client'
import AgentInstaller from 'src/domain/agent-installer'
import { ContainerState as ProtoContainerState } from 'src/grpc/protobuf/proto/common'
import { NodeConnectionStatus as ProtoNodeConnectionStatus } from 'src/grpc/protobuf/proto/crux'
import { ContainerState } from 'src/shared/models'
import AgentService from '../agent/agent.service'
import { NodeType } from '../shared/shared.dto'
import SharedMapper from '../shared/shared.mapper'
import { NodeDetailsDto, NodeDto, NodeInstallDto } from './node.dto'

@Injectable()
export default class NodeMapper {
  constructor(private agentService: AgentService, private sharedMapper: SharedMapper) {}

  listItemToDto(node: Node): NodeDto {
    const agent = this.agentService.getById(node.id)

    const status = agent?.getConnectionStatus() ?? ProtoNodeConnectionStatus.UNREACHABLE
    return {
      id: node.id,
      name: node.name,
      description: node.description,
      icon: node.icon,
      address: agent?.address,
      status: this.sharedMapper.nodeStatusToDto(status),
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

  containerGrpcStateToDto(state: ProtoContainerState): ContainerState {
    switch (state) {
      case ProtoContainerState.CREATED:
        return 'created'
      case ProtoContainerState.DEAD:
        return 'dead'
      case ProtoContainerState.EXITED:
        return 'exited'
      case ProtoContainerState.PAUSED:
        return 'paused'
      case ProtoContainerState.REMOVING:
        return 'removing'
      case ProtoContainerState.RESTARTING:
        return 'restarting'
      case ProtoContainerState.RUNNING:
        return 'running'
      default:
        throw new BadRequestException({
          message: 'Unknown ContainerState',
          property: 'state',
          value: state,
        })
    }
  }
}
