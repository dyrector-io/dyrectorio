import {
  Controller,
  Body,
  Get,
  UseGuards,
  UseInterceptors,
  Param,
  Post,
  HttpCode,
  Put,
  Delete,
  PipeTransform,
  Type,
  Header,
} from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import { first, Observable, timeout } from 'rxjs'
import { ContainerStateListMessage } from 'src/grpc/protobuf/proto/common'
import { WatchContainerStateRequest } from 'src/grpc/protobuf/proto/crux'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import { DisableAccessCheck, DisableIdentity } from 'src/shared/user-access.guard'
import { CreatedResponse, CreatedWithLocation } from '../shared/created-with-location.decorator'
import CreatedWithLocationInterceptor from '../shared/created-with-location.interceptor'
import JwtAuthGuard, { IdentityFromRequest } from '../token/jwt-auth.guard'
import NodeTeamAccessHttpGuard from './guards/node.team-access.http.guard'
import {
  CreateNodeDto,
  NodeGenerateScriptDto,
  NodeDetailsDto,
  NodeDto,
  NodeInstallDto,
  UpdateNodeDto,
  NodeContainerCommandDto,
  NodeDeleteContainerDto,
} from './node.dto'
import NodeService from './node.service'
import NodeGenerateScriptValidationPipe from './pipes/node.generate-script.pipe'
import NodeGetScriptValidationPipe from './pipes/node.get-script.pipe'

const ROUTE_NODES = 'nodes'
const ROUTE_NODE_ID = ':nodeId'
const NodeId = (...pipes: (Type<PipeTransform> | PipeTransform)[]) => Param('nodeId', ...pipes)

@Controller(ROUTE_NODES)
@ApiTags(ROUTE_NODES)
@UseGuards(JwtAuthGuard, NodeTeamAccessHttpGuard)
@UseInterceptors(HttpLoggerInterceptor, PrismaErrorInterceptor, CreatedWithLocationInterceptor)
export default class NodeHttpController {
  constructor(private service: NodeService) {}

  @Get()
  @ApiOkResponse({
    type: NodeDto,
    isArray: true,
  })
  async getNodes(@IdentityFromRequest() identity: Identity): Promise<NodeDto[]> {
    return this.service.getNodes(identity)
  }

  @Post()
  @CreatedWithLocation()
  @ApiBody({ type: CreateNodeDto })
  @ApiCreatedResponse({ type: NodeDto })
  async createNode(
    @Body() request: CreateNodeDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<NodeDto>> {
    const node = await this.service.createNode(request, identity)

    return {
      url: `/nodes/${node.id}`,
      body: node,
    }
  }

  @Put(ROUTE_NODE_ID)
  @HttpCode(204)
  @ApiNoContentResponse()
  async updateNode(
    @NodeId() id: string,
    @Body() request: UpdateNodeDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.updateNode(id, request, identity)
  }

  @Delete(ROUTE_NODE_ID)
  @HttpCode(204)
  async deleteProduct(@NodeId() nodeId: string): Promise<void> {
    return this.service.deleteNode(nodeId)
  }

  @Post(`${ROUTE_NODE_ID}/setup`)
  @ApiOkResponse({ type: NodeInstallDto })
  async generateScript(
    @NodeId(NodeGenerateScriptValidationPipe) nodeId: string,
    @Body() request: NodeGenerateScriptDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<NodeInstallDto> {
    return await this.service.generateScript(nodeId, request, identity)
  }

  @Delete(`${ROUTE_NODE_ID}/setup`)
  @HttpCode(204)
  @ApiNoContentResponse()
  async discardScript(@NodeId() nodeId: string): Promise<void> {
    return await this.service.discardScript(nodeId)
  }

  @Get(`${ROUTE_NODE_ID}/script`)
  @ApiOkResponse({ type: 'string' })
  @Header('content-type', 'text/plain')
  @DisableAccessCheck()
  @DisableIdentity()
  async getScript(@NodeId(NodeGetScriptValidationPipe) nodeId: string): Promise<string> {
    return await this.service.getScript(nodeId)
  }

  @Delete(`${ROUTE_NODE_ID}/token`)
  @HttpCode(204)
  @ApiNoContentResponse()
  async revokeToken(@NodeId() nodeId: string, @IdentityFromRequest() identity: Identity): Promise<void> {
    return await this.service.revokeToken(nodeId, identity)
  }

  @Post(`${ROUTE_NODE_ID}/update`)
  @HttpCode(204)
  @ApiNoContentResponse()
  async updateNodeAgent(@NodeId() nodeId: string): Promise<void> {
    this.service.updateNodeAgent(nodeId)
  }

  @Post(`${ROUTE_NODE_ID}/container`)
  @HttpCode(204)
  @ApiNoContentResponse()
  sendContainerCommand(@NodeId() nodeId: string, @Body() request: NodeContainerCommandDto) {
    this.service.sendContainerCommand(nodeId, request)
  }

  @Delete(`${ROUTE_NODE_ID}/container`)
  @HttpCode(204)
  @ApiNoContentResponse()
  deleteContainers(@NodeId() nodeId: string, @Body() request: NodeDeleteContainerDto) {
    this.service.deleteContainers(nodeId, request)
  }

  @Get(ROUTE_NODE_ID)
  @ApiOkResponse({ type: NodeDetailsDto })
  async getNodeDetails(@NodeId() nodeId: string): Promise<NodeDetailsDto> {
    return this.service.getNodeDetails(nodeId)
  }
}
