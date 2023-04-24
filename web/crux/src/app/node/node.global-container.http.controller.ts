import { Controller, Delete, HttpCode, Post, UseGuards, UseInterceptors } from '@nestjs/common'
import { ApiNoContentResponse, ApiTags } from '@nestjs/swagger'
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
