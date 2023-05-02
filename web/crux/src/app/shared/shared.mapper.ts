import { Node, Product, Team, Version } from '@prisma/client'
import {
  AuditDto,
  BasicNodeDto,
  BasicNodeWithStatus,
  BasicProductDto,
  BasicProperties,
  BasicTeamDto,
  BasicVersionDto,
  NodeConnectionStatus,
} from './shared.dto'

export default class SharedMapper {
  auditToDto(it: Audit): AuditDto {
    return {
      createdAt: it.createdAt,
      createdBy: it.createdBy,
      updatedAt: it.updatedAt,
      updatedBy: it.updatedBy ? it.updatedBy : it.createdBy,
    }
  }

  nodeToBasicDto(it: Pick<Node, BasicProperties>): BasicNodeDto {
    return {
      id: it.id,
      name: it.name,
      type: it.type,
    }
  }

  nodeToBasicWithStatusDto(it: Pick<Node, BasicProperties>, status: NodeConnectionStatus): BasicNodeWithStatus {
    return {
      id: it.id,
      name: it.name,
      type: it.type,
      status,
    }
  }

  productToBasicDto(it: Pick<Product, BasicProperties>): BasicProductDto {
    return {
      id: it.id,
      name: it.name,
      type: it.type,
    }
  }

  versionToBasicDto(it: Pick<Version, BasicProperties>): BasicVersionDto {
    return {
      id: it.id,
      name: it.name,
      type: it.type,
    }
  }

  teamToBasicDto(it: Pick<Team, 'id' | 'name'>): BasicTeamDto {
    return {
      id: it.id,
      name: it.name,
    }
  }
}

type Audit = {
  createdBy: string
  createdAt: Date
  updatedBy?: string
  updatedAt: Date
}
