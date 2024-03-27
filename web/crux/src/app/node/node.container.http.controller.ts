import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common'
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
  Name,
  NodeId,
  PARAM_NODE_ID,
  Prefix,
  ROUTE_CONTAINERS,
  ROUTE_NAME,
  ROUTE_NODES,
  ROUTE_NODE_ID,
  ROUTE_PREFIX,
  ROUTE_TEAM_SLUG,
} from './node.const'
import { ContainerInspectionDto } from './node.dto'
import NodeService from './node.service'

const PARAM_TEAM_SLUG = 'teamSlug'
const TeamSlug = () => Param(PARAM_TEAM_SLUG)

@Controller(`${ROUTE_TEAM_SLUG}/${ROUTE_NODES}/${ROUTE_NODE_ID}/${ROUTE_PREFIX}/${ROUTE_CONTAINERS}`)
@ApiTags(ROUTE_NODES)
@UseGuards(NodeTeamAccessGuard)
export default class NodeContainerHttpController {
  constructor(private service: NodeService) {}

  @Post(`${ROUTE_NAME}/start`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Request must include `nodeId`, `prefix`, and the `name` of the container.',
    summary: 'Start a container deployed with dyrector.io on a node.',
  })
  @ApiNoContentResponse({ description: 'Container started.' })
  @ApiBadRequestResponse({ description: 'Bad request for container starting.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for container starting.' })
  @UuidParams(PARAM_NODE_ID)
  async startContainer(
    @TeamSlug() _: string,
    @NodeId() nodeId: string,
    @Prefix() prefix: string,
    @Name() name: string,
  ): Promise<void> {
    await this.service.startContainer(nodeId, prefix, name)
  }

  @Post(`${ROUTE_NAME}/stop`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Request must include `nodeId`, `prefix`, and the `name` of the container.',
    summary: 'Stop a container deployed with dyrector.io on a node.',
  })
  @ApiNoContentResponse({ description: 'Container stopped.' })
  @ApiBadRequestResponse({ description: 'Bad request for container stopping.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for container stopping.' })
  @UuidParams(PARAM_NODE_ID)
  async stopContainer(
    @TeamSlug() _: string,
    @NodeId() nodeId: string,
    @Prefix() prefix: string,
    @Name() name: string,
  ): Promise<void> {
    await this.service.stopContainer(nodeId, prefix, name)
  }

  @Post(`${ROUTE_NAME}/restart`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Request must include `nodeId`, `prefix`, and the `name` of the container.',
    summary: 'Restart a container deployed with dyrector.io on a node.',
  })
  @ApiNoContentResponse({ description: 'Container restarted.' })
  @ApiBadRequestResponse({ description: 'Bad request for container restarting.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for container restarting.' })
  @UuidParams(PARAM_NODE_ID)
  async restartContainer(
    @TeamSlug() _: string,
    @NodeId() nodeId: string,
    @Prefix() prefix: string,
    @Name() name: string,
  ): Promise<void> {
    await this.service.restartContainer(nodeId, prefix, name)
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Request must include `nodeId`, and `prefix`.',
    summary: 'Delete containers deployed with dyrector.io, with the specified prefix on a node.',
  })
  @ApiNoContentResponse({ description: 'Containers deleted.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for container delete.' })
  @ApiNotFoundResponse({ description: 'Container not found.' })
  @UuidParams(PARAM_NODE_ID)
  deleteAllContainers(@TeamSlug() _: string, @NodeId() nodeId: string, @Prefix() prefix: string): Observable<void> {
    return from(this.service.deleteAllContainers(nodeId, prefix)).pipe(mergeAll())
  }

  @Delete(`${ROUTE_NAME}`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Request must include `nodeId`, `prefix`, and the `name` of the container.',
    summary: 'Delete a container deployed with dyrector.io, with the specified prefix and name on a node.',
  })
  @ApiNoContentResponse({ description: 'Container deleted.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for container delete.' })
  @ApiNotFoundResponse({ description: 'Container not found.' })
  @UuidParams(PARAM_NODE_ID)
  deleteContainer(
    @TeamSlug() _: string,
    @NodeId() nodeId: string,
    @Prefix() prefix: string,
    @Name() name: string,
  ): Observable<void> {
    return from(this.service.deleteContainer(nodeId, prefix, name)).pipe(mergeAll())
  }

  @Get(`${ROUTE_NAME}/inspect`)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: 'Request must include `nodeId`, `prefix`, and the `name` of the container.',
    summary: 'Inspect a container with the specified prefix and name on a node.',
  })
  @ApiOkResponse({ type: ContainerInspectionDto, description: 'Container inspection.' })
  @ApiBadRequestResponse({ description: 'Bad request for container inspection.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for container inspection.' })
  @UuidParams(PARAM_NODE_ID)
  async inspectContainer(
    @NodeId() nodeId: string,
    @Prefix() prefix: string,
    @Name() name: string,
  ): Promise<ContainerInspectionDto> {
    return await this.service.inspectContainer(nodeId, prefix, name)
  }

  @Get(`${ROUTE_NAME}/log`)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: 'Request must include `nodeId`, `prefix`, and the `name` of the container.',
    summary: 'Get the logs of a container.',
  })
  @ApiOkResponse({ description: 'Container log.', type: String })
  @ApiBadRequestResponse({ description: 'Bad request for container log.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for container log.' })
  @UuidParams(PARAM_NODE_ID)
  async getContainerLog(
    @TeamSlug() _: string,
    @NodeId() nodeId: string,
    @Prefix() prefix: string,
    @Name() name: string,
  ): Promise<string[]> {
    return this.service.getContainerLog(nodeId, prefix, name)
  }
}
