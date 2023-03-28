import { Node, Product, Version } from '@prisma/client'
import { AuditDto, BasicNodeDto, BasicProductDto, BasicProperties, BasicVersionDto } from './shared.dto'

export default class SharedMapper {
  auditToDto(it: Audit): AuditDto {
    return {
      createdAt: it.createdAt,
      createdBy: it.createdBy,
      updatedAt: it.updatedAt,
      updatedBy: it.updatedBy,
    }
  }

  nodeToBasicDto(it: Pick<Node, BasicProperties>): BasicNodeDto {
    return {
      id: it.id,
      name: it.name,
      type: it.type,
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
}

type Audit = {
  createdBy: string
  createdAt: Date
  updatedBy?: string
  updatedAt: Date
}
