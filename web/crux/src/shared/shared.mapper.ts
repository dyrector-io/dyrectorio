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
} from './dtos/shared.dto'

export const auditToDto = (it: Audit): AuditDto => ({
  createdAt: it.createdAt,
  createdBy: it.createdBy,
  updatedAt: it.updatedAt,
  updatedBy: it.updatedBy ? it.updatedBy : it.createdBy,
})

export const productToBasicDto = (it: Pick<Product, BasicProperties>): BasicProductDto => ({
  id: it.id,
  name: it.name,
  type: it.type,
})

export const nodeToBasicDto = (it: Pick<Node, BasicProperties>): BasicNodeDto => ({
  id: it.id,
  name: it.name,
  type: it.type,
})

export const nodeToBasicWithStatusDto = (
  it: Pick<Node, BasicProperties>,
  status: NodeConnectionStatus,
): BasicNodeWithStatus => ({
  id: it.id,
  name: it.name,
  type: it.type,
  status,
})

export const versionToBasicDto = (it: Pick<Version, BasicProperties>): BasicVersionDto => ({
  id: it.id,
  name: it.name,
  type: it.type,
})

export const teamToBasicDto = (it: Pick<Team, 'id' | 'name'>): BasicTeamDto => ({
  id: it.id,
  name: it.name,
})

type Audit = {
  createdBy: string
  createdAt: Date
  updatedBy?: string
  updatedAt: Date
}
