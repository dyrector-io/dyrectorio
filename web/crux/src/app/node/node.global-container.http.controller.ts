import { Controller, Delete, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common'
import { ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Observable } from 'rxjs'
import UuidParams from 'src/decorators/api-params.decorator'
import NodeTeamAccessHttpGuard from './guards/node.team-access.http.guard'
import {
  GLOBAL_PREFIX,
  Name,
  NodeId,
  PARAM_NODE_ID,
  ROUTE_CONTAINERS,
  ROUTE_NAME,
  ROUTE_NODES,
  ROUTE_NODE_ID,
} from './node.const'
import { ContainerDto } from './node.dto'
import NodeService from './node.service'

@Controller(`${ROUTE_NODES}/${ROUTE_NODE_ID}/${ROUTE_CONTAINERS}`)
@ApiTags(ROUTE_NODES)
@UseGuards(NodeTeamAccessHttpGuard)
export default class NodeGlobalContainerHttpController {
  constructor(private service: NodeService) {}

  @Get(`${ROUTE_NODE_ID}/containers`)
  @HttpCode(200)
  @ApiOkResponse({ type: ContainerDto, isArray: true })
  async getContainers(@NodeId() nodeId: string, @Query('prefix') prefix?: string): Promise<ContainerDto[]> {
    return await this.service.getContainers(nodeId, prefix)
  }

  @Post(`${ROUTE_NAME}/start`)
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Start containers on a node.' })
  @UuidParams(PARAM_NODE_ID)
  startContainer(@NodeId() nodeId: string, @Name() name: string) {
    this.service.startContainer(nodeId, GLOBAL_PREFIX, name)
  }

  @Post(`${ROUTE_NAME}/stop`)
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Stop containers on a node.' })
  @UuidParams(PARAM_NODE_ID)
  stopContainer(@NodeId() nodeId: string, @Name() name: string) {
    this.service.stopContainer(nodeId, GLOBAL_PREFIX, name)
  }

  @Post(`${ROUTE_NAME}/restart`)
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Restart containers on a node.' })
  @UuidParams(PARAM_NODE_ID)
  restartContainer(@NodeId() nodeId: string, @Name() name: string) {
    this.service.restartContainer(nodeId, GLOBAL_PREFIX, name)
  }

  @Delete(`${ROUTE_NAME}`)
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Delete a specific container on a node.' })
  @UuidParams(PARAM_NODE_ID)
  deleteContainer(@NodeId() nodeId: string, @Name() name: string): Observable<void> {
    return this.service.deleteContainer(nodeId, GLOBAL_PREFIX, name)
  }
}
