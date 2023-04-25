import { Controller, Delete, Get, HttpCode, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common'
import { ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Observable } from 'rxjs'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import CreatedWithLocationInterceptor from '../shared/created-with-location.interceptor'
import JwtAuthGuard from '../token/jwt-auth.guard'
import NodeTeamAccessHttpGuard from './guards/node.team-access.http.guard'
import { GLOBAL_PREFIX, Name, NodeId, ROUTE_CONTAINERS, ROUTE_NAME, ROUTE_NODES, ROUTE_NODE_ID } from './node.const'
import NodeService from './node.service'
import { ContainerDto } from './node.dto'

@Controller(`${ROUTE_NODES}/${ROUTE_NODE_ID}/${ROUTE_CONTAINERS}`)
@ApiTags(ROUTE_NODES)
@UseGuards(JwtAuthGuard, NodeTeamAccessHttpGuard)
@UseInterceptors(HttpLoggerInterceptor, PrismaErrorInterceptor, CreatedWithLocationInterceptor)
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
  @ApiNoContentResponse()
  startContainer(@NodeId() nodeId: string, @Name() name: string) {
    this.service.startContainer(nodeId, GLOBAL_PREFIX, name)
  }

  @Post(`${ROUTE_NAME}/stop`)
  @HttpCode(204)
  @ApiNoContentResponse()
  stopContainer(@NodeId() nodeId: string, @Name() name: string) {
    this.service.stopContainer(nodeId, GLOBAL_PREFIX, name)
  }

  @Post(`${ROUTE_NAME}/restart`)
  @HttpCode(204)
  @ApiNoContentResponse()
  restartContainer(@NodeId() nodeId: string, @Name() name: string) {
    this.service.restartContainer(nodeId, GLOBAL_PREFIX, name)
  }

  @Delete(`${ROUTE_NAME}`)
  @HttpCode(204)
  @ApiNoContentResponse()
  deleteContainer(@NodeId() nodeId: string, @Name() name: string): Observable<void> {
    return this.service.deleteContainer(nodeId, GLOBAL_PREFIX, name)
  }
}
