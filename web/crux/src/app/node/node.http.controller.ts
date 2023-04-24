import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiProduces, ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import { Observable, timeout } from 'rxjs'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import UuidValidationGuard from 'src/guards/uuid-params.validation.guard'
import UuidParams from 'src/decorators/api-params.decorator'
import { CreatedResponse, CreatedWithLocation } from '../shared/created-with-location.decorator'
import CreatedWithLocationInterceptor from '../shared/created-with-location.interceptor'
import JwtAuthGuard, { DisableAuth, IdentityFromRequest } from '../token/jwt-auth.guard'
import NodeTeamAccessHttpGuard from './guards/node.team-access.http.guard'
import { NodeId, ROUTE_NODES, ROUTE_NODE_ID } from './node.const'
import {
  ContainerStatus,
  CreateNodeDto,
  NodeDetailsDto,
  NodeDto,
  NodeGenerateScriptDto,
  NodeInstallDto,
  UpdateNodeDto,
} from './node.dto'
import NodeService from './node.service'
import NodeGenerateScriptValidationPipe from './pipes/node.generate-script.pipe'
import NodeGetScriptValidationPipe from './pipes/node.get-script.pipe'

@Controller(ROUTE_NODES)
@ApiTags(ROUTE_NODES)
@UseGuards(JwtAuthGuard, UuidValidationGuard, NodeTeamAccessHttpGuard)
@UseInterceptors(HttpLoggerInterceptor, PrismaErrorInterceptor, CreatedWithLocationInterceptor)
export default class NodeHttpController {
  constructor(private service: NodeService) {}

  @Get()
  @HttpCode(200)
  @ApiOkResponse({
    type: NodeDto,
    isArray: true,
  })
  async getNodes(@IdentityFromRequest() identity: Identity): Promise<NodeDto[]> {
    return this.service.getNodes(identity)
  }

  @Get(ROUTE_NODE_ID)
  @HttpCode(200)
  @ApiOkResponse({ type: NodeDetailsDto })
  @UuidParams('nodeId')
  async getNodeDetails(@NodeId() nodeId: string): Promise<NodeDetailsDto> {
    return this.service.getNodeDetails(nodeId)
  }

  @Post()
  @HttpCode(201)
  @CreatedWithLocation()
  @ApiBody({ type: CreateNodeDto })
  @ApiCreatedResponse({ type: NodeDto })
  async createNode(
    @Body() request: CreateNodeDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<NodeDto>> {
    const node = await this.service.createNode(request, identity)

    return {
      url: `/${ROUTE_NODES}/${node.id}`,
      body: node,
    }
  }

  @Put(ROUTE_NODE_ID)
  @HttpCode(204)
  @ApiNoContentResponse()
  @UuidParams('nodeId')
  async updateNode(
    @NodeId() id: string,
    @Body() request: UpdateNodeDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.updateNode(id, request, identity)
  }

  @Delete(ROUTE_NODE_ID)
  @HttpCode(204)
  @ApiNoContentResponse()
  @UuidParams('nodeId')
  async deleteNode(@NodeId() nodeId: string): Promise<void> {
    return this.service.deleteNode(nodeId)
  }

  @Post(`${ROUTE_NODE_ID}/script`)
  @HttpCode(201)
  @ApiOkResponse({ type: NodeInstallDto })
  @UuidParams('nodeId')
  async generateScript(
    @NodeId(NodeGenerateScriptValidationPipe) nodeId: string,
    @Body() request: NodeGenerateScriptDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<NodeInstallDto> {
    return await this.service.generateScript(nodeId, request, identity)
  }

  @Delete(`${ROUTE_NODE_ID}/script`)
  @HttpCode(204)
  @ApiNoContentResponse()
  async discardScript(@NodeId() nodeId: string): Promise<void> {
    return await this.service.discardScript(nodeId)
  }

  @Get(`${ROUTE_NODE_ID}/script`)
  @ApiProduces('text/plain')
  @Header('content-type', 'text/plain')
  @DisableAuth()
  @UuidParams('nodeId')
  async getScript(@NodeId(NodeGetScriptValidationPipe) nodeId: string): Promise<string> {
    return await this.service.getScript(nodeId)
  }

  @Delete(`${ROUTE_NODE_ID}/token`)
  @HttpCode(204)
  @ApiNoContentResponse()
  @UuidParams('nodeId')
  async revokeToken(@NodeId() nodeId: string, @IdentityFromRequest() identity: Identity): Promise<void> {
    return await this.service.revokeToken(nodeId, identity)
  }

  @Post(`${ROUTE_NODE_ID}/update`)
  @HttpCode(204)
  @ApiNoContentResponse()
  @UuidParams('nodeId')
  async updateNodeAgent(@NodeId() nodeId: string): Promise<void> {
    this.service.updateNodeAgent(nodeId)
  }

  @Get(`${ROUTE_NODE_ID}/container`)
  @HttpCode(200)
  @ApiOkResponse({ type: ContainerStatus, isArray: true })
  @UuidParams('nodeId')
  async getContainerStatus(@NodeId() nodeId: string, @Query('prefix') prefix: string): Promise<Observable<any>> {
    return this.service.handleWatchContainerStatusDto(nodeId, prefix).pipe(timeout(5000))
  }
}
