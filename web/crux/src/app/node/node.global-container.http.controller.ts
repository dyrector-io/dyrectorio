import { Controller, Delete, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { Observable, from, mergeAll } from 'rxjs'
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
  ROUTE_TEAM_SLUG,
} from './node.const'
import { ContainerDto } from './node.dto'
import NodeService from './node.service'

@Controller(`${ROUTE_TEAM_SLUG}/${ROUTE_NODES}/${ROUTE_NODE_ID}/${ROUTE_CONTAINERS}`)
@ApiTags(ROUTE_NODES)
@UseGuards(NodeTeamAccessGuard)
export default class NodeGlobalContainerHttpController {
  constructor(private service: NodeService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description:
      'Request must include `nodeId` and `prefix`. Response should include `id`, `command`, `createdAt`, `state`, `status`, `imageName`, `imageTag` and `ports` of images.',
    summary: 'Fetch data of all containers on a node.',
  })
  @ApiOkResponse({ type: ContainerDto, isArray: true, description: 'Fetch data of containers running on a node.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for containers.' })
  async getContainers(@NodeId() nodeId: string, @Query('prefix') prefix?: string): Promise<ContainerDto[]> {
    return await this.service.getContainers(nodeId, prefix)
  }

  @Post(`${ROUTE_NAME}/start`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Request must include `nodeId`, and the `name` of the container.',
    summary: 'Start the specific container on a node.',
  })
  @ApiNoContentResponse({ description: 'Container started.' })
  @ApiBadRequestResponse({ description: 'Bad request for container starting.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for container starting.' })
  @UuidParams(PARAM_NODE_ID)
  async startContainer(@NodeId() nodeId: string, @Name() name: string): Promise<void> {
    await this.service.startContainer(nodeId, GLOBAL_PREFIX, name)
  }

  @Post(`${ROUTE_NAME}/stop`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Request must include `nodeId`, and the `name` of the container.',
    summary: 'Stop the specific container on a node.',
  })
  @ApiNoContentResponse({ description: 'Container stopped.' })
  @ApiBadRequestResponse({ description: 'Bad request for container stopping.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for container stopping.' })
  @UuidParams(PARAM_NODE_ID)
  async stopContainer(@NodeId() nodeId: string, @Name() name: string): Promise<void> {
    await this.service.stopContainer(nodeId, GLOBAL_PREFIX, name)
  }

  @Post(`${ROUTE_NAME}/restart`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Request must include `nodeId`, and the `name` of the container.',
    summary: 'Restart the specific container on a node.',
  })
  @ApiNoContentResponse({ description: 'Container restarted.' })
  @ApiBadRequestResponse({ description: 'Bad request for container restarting.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for container restarting.' })
  @UuidParams(PARAM_NODE_ID)
  async restartContainer(@NodeId() nodeId: string, @Name() name: string): Promise<void> {
    await this.service.restartContainer(nodeId, GLOBAL_PREFIX, name)
  }

  @Delete(`${ROUTE_NAME}`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Request must include `nodeId`, and the `name` of the container.',
    summary: 'Delete the specific container from a node.',
  })
  @ApiNoContentResponse({ description: 'Container deleted.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for container delete.' })
  @ApiNotFoundResponse({ description: 'Container not found.' })
  @UuidParams(PARAM_NODE_ID)
  deleteContainer(@NodeId() nodeId: string, @Name() name: string): Observable<void> {
    return from(this.service.deleteContainer(nodeId, GLOBAL_PREFIX, name)).pipe(mergeAll())
  }
}
