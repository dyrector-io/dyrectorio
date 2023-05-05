import { Controller, Delete, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common'
import { ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Observable } from 'rxjs'
import UuidParams from 'src/decorators/api-params.decorator'
import NodeTeamAccessGuard from './guards/node.team-access.http.guard'
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
@UseGuards(NodeTeamAccessGuard)
export default class NodeGlobalContainerHttpController {
  constructor(private service: NodeService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    description:
      'Request must include `nodeId` and `prefix`. Response should include `id`, `command`, `createdAt`, `state`, `status`, `imageName`, `imageTag` and `ports` of images.',
    summary: 'Fetch data of all containers on a node.',
  })
  @ApiOkResponse({ type: ContainerDto, isArray: true, description: 'Fetch data of containers running on a node.' })
  async getContainers(@NodeId() nodeId: string, @Query('prefix') prefix?: string): Promise<ContainerDto[]> {
    return await this.service.getContainers(nodeId, prefix)
  }

  @Post(`${ROUTE_NAME}/start`)
  @HttpCode(204)
  @ApiOperation({
    description: 'Request must include `nodeId`, and the `name` of the container.',
    summary: 'Start the specific container on a node.',
  })
  @ApiNoContentResponse({ description: 'Container started.' })
  @UuidParams(PARAM_NODE_ID)
  startContainer(@NodeId() nodeId: string, @Name() name: string) {
    this.service.startContainer(nodeId, GLOBAL_PREFIX, name)
  }

  @Post(`${ROUTE_NAME}/stop`)
  @HttpCode(204)
  @ApiOperation({
    description: 'Request must include `nodeId`, and the `name` of the container.',
    summary: 'Stop the specific container on a node.',
  })
  @ApiNoContentResponse({ description: 'Container stopped.' })
  @UuidParams(PARAM_NODE_ID)
  stopContainer(@NodeId() nodeId: string, @Name() name: string) {
    this.service.stopContainer(nodeId, GLOBAL_PREFIX, name)
  }

  @Post(`${ROUTE_NAME}/restart`)
  @HttpCode(204)
  @ApiOperation({
    description: 'Request must include `nodeId`, and the `name` of the container.',
    summary: 'Restart the specific container on a node.',
  })
  @ApiNoContentResponse({ description: 'Container restarted.' })
  @UuidParams(PARAM_NODE_ID)
  restartContainer(@NodeId() nodeId: string, @Name() name: string) {
    this.service.restartContainer(nodeId, GLOBAL_PREFIX, name)
  }

  @Delete(`${ROUTE_NAME}`)
  @HttpCode(204)
  @ApiOperation({
    description: 'Request must include `nodeId`, and the `name` of the container.',
    summary: 'Delete the specific container from a node.',
  })
  @ApiNoContentResponse({ description: 'Container deleted.' })
  @UuidParams(PARAM_NODE_ID)
  deleteContainer(@NodeId() nodeId: string, @Name() name: string): Observable<void> {
    return this.service.deleteContainer(nodeId, GLOBAL_PREFIX, name)
  }
}
