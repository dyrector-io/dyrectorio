import { Controller, Delete, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { ApiNoContentResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
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
} from './node.const'
import NodeService from './node.service'

@Controller(`${ROUTE_NODES}/${ROUTE_NODE_ID}/${ROUTE_PREFIX}/${ROUTE_CONTAINERS}`)
@ApiTags(ROUTE_NODES)
@UseGuards(NodeTeamAccessGuard)
export default class NodePrefixContainerHttpController {
  constructor(private service: NodeService) {}

  @Post(`${ROUTE_NAME}/start`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Request must include `nodeId`, `prefix`, and `name`.',
    summary: 'Start a container deployed with dyrector.io on a node.',
  })
  @ApiNoContentResponse({ description: 'Container started.' })
  @UuidParams(PARAM_NODE_ID)
  startContainer(@NodeId() nodeId: string, @Prefix() prefix: string, @Name() name: string) {
    this.service.startContainer(nodeId, prefix, name)
  }

  @Post(`${ROUTE_NAME}/stop`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Request must include `nodeId`, `prefix`, and `name`.',
    summary: 'Stop a container deployed with dyrector.io on a node.',
  })
  @ApiNoContentResponse({ description: 'Container stopped.' })
  @UuidParams(PARAM_NODE_ID)
  stopContainer(@NodeId() nodeId: string, @Prefix() prefix: string, @Name() name: string) {
    this.service.stopContainer(nodeId, prefix, name)
  }

  @Post(`${ROUTE_NAME}/restart`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Request must include `nodeId`, `prefix`, and `name`.',
    summary: 'Restart a container deployed with dyrector.io on a node.',
  })
  @ApiNoContentResponse({ description: 'Container restarted.' })
  @UuidParams(PARAM_NODE_ID)
  restartContainer(@NodeId() nodeId: string, @Prefix() prefix: string, @Name() name: string) {
    this.service.restartContainer(nodeId, prefix, name)
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Request must include `nodeId`, and `prefix`.',
    summary: 'Delete containers deployed with dyrector.io, with the specified prefix on a node.',
  })
  @ApiNoContentResponse({ description: 'Containers deleted.' })
  @UuidParams(PARAM_NODE_ID)
  deleteAllContainers(@NodeId() nodeId: string, @Prefix() prefix: string): Observable<void> {
    return from(this.service.deleteAllContainers(nodeId, prefix)).pipe(mergeAll())
  }

  @Delete(`${ROUTE_NAME}`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Request must include `nodeId`, `prefix`, and `name`.',
    summary: 'Delete a container deployed with dyrector.io, with the specified prefix and name on a node.',
  })
  @ApiNoContentResponse({ description: 'Container deleted.' })
  @UuidParams(PARAM_NODE_ID)
  deleteContainer(@NodeId() nodeId: string, @Prefix() prefix: string, @Name() name: string): Observable<void> {
    return from(this.service.deleteContainer(nodeId, prefix, name)).pipe(mergeAll())
  }
}
