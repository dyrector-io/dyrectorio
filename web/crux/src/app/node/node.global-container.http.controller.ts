import { Controller, Delete, HttpCode, Post, UseGuards, UseInterceptors } from '@nestjs/common'
import { ApiNoContentResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Observable } from 'rxjs'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import UuidValidationGuard from 'src/guards/uuid-params.validation.guard'
import UuidParams from 'src/decorators/api-params.decorator'
import CreatedWithLocationInterceptor from '../shared/created-with-location.interceptor'
import JwtAuthGuard from '../token/jwt-auth.guard'
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
import NodeService from './node.service'

@Controller(`${ROUTE_NODES}/${ROUTE_NODE_ID}/${ROUTE_CONTAINERS}`)
@ApiTags(ROUTE_NODES)
@UseGuards(JwtAuthGuard, UuidValidationGuard, NodeTeamAccessHttpGuard)
@UseInterceptors(HttpLoggerInterceptor, PrismaErrorInterceptor, CreatedWithLocationInterceptor)
export default class NodeGlobalContainerHttpController {
  constructor(private service: NodeService) {}

  @Post(`${ROUTE_NAME}/start`)
  @HttpCode(204)
  @ApiOperation({
    description: 'Request must include `nodeId`, and the `name` of the container.',
    summary: 'Start any container on a node.',
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
    summary: 'Stop any container on a node.',
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
    summary: 'Restart any container on a node.',
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
    summary: 'Delete any container from a node.',
  })
  @ApiNoContentResponse({ description: 'Container deleted.' })
  @UuidParams(PARAM_NODE_ID)
  deleteContainer(@NodeId() nodeId: string, @Name() name: string): Observable<void> {
    return this.service.deleteContainer(nodeId, GLOBAL_PREFIX, name)
  }
}
