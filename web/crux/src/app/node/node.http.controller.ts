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
import {
  ApiBody,
  ApiOperation,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger'
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
import { NodeId, PARAM_NODE_ID, ROUTE_NODES, ROUTE_NODE_ID } from './node.const'
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
  @ApiOperation({
    description:
      "Fetch data of deployment targets. Response should include an array with the node's `type`, `status`, `description`, `icon`, `address`, `connectedAt` date, `version`, `updating`, `id`, and `name`.",
    summary: 'Get data of nodes that belong to your team.',
  })
  @ApiOkResponse({
    type: NodeDto,
    isArray: true,
    description: 'Data of nodes listed.',
  })
  async getNodes(@IdentityFromRequest() identity: Identity): Promise<NodeDto[]> {
    return this.service.getNodes(identity)
  }

  @Get(ROUTE_NODE_ID)
  @HttpCode(200)
  @ApiOperation({
    description:
      "Fetch data of a specific node. Request must include `nodeId`. Response should include an array with the node's `type`, `status`, `description`, `icon`, `address`, `connectedAt` date, `version`, `updating`, `id`, `name`, `hasToken`, and agent installation details.",
    summary: 'Get data of nodes that belong to your team.',
  })
  @ApiOkResponse({ type: NodeDetailsDto, description: 'Data of the node is listed.' })
  @UuidParams(PARAM_NODE_ID)
  async getNodeDetails(@NodeId() nodeId: string): Promise<NodeDetailsDto> {
    return this.service.getNodeDetails(nodeId)
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({
    description:
      "Request must include the node's `name`. Response should include an array with the node's `type`, `status`, `description`, `icon`, `address`, `connectedAt` date, `version`, `updating`, `id`, and `name`.",
    summary: 'Create new node.',
  })
  @CreatedWithLocation()
  @ApiBody({ type: CreateNodeDto })
  @ApiCreatedResponse({ type: NodeDto, description: 'New node created.' })
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
  @ApiOperation({
    description: "Request must include the node's `name`, body can include `description` and `icon`.",
    summary: 'Update details of a node.',
  })
  @ApiNoContentResponse({ description: 'Node details modified.' })
  @UuidParams(PARAM_NODE_ID)
  async updateNode(
    @NodeId() id: string,
    @Body() request: UpdateNodeDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.updateNode(id, request, identity)
  }

  @Delete(ROUTE_NODE_ID)
  @HttpCode(204)
  @ApiOperation({
    description: 'Request must include `nodeId`.',
    summary: 'Delete node.',
  })
  @ApiNoContentResponse({ description: 'Node deleted.' })
  @UuidParams(PARAM_NODE_ID)
  async deleteNode(@NodeId() nodeId: string): Promise<void> {
    return this.service.deleteNode(nodeId)
  }

  @Post(`${ROUTE_NODE_ID}/script`)
  @HttpCode(201)
  @ApiOperation({
    description: 'Request must include `nodeId`, `type` and `scriptType`.',
    summary: 'Create agent install script.',
  })
  @ApiOkResponse({ type: NodeInstallDto, description: 'Install script generated.' })
  @UuidParams(PARAM_NODE_ID)
  async generateScript(
    @NodeId(NodeGenerateScriptValidationPipe) nodeId: string,
    @Body() request: NodeGenerateScriptDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<NodeInstallDto> {
    return await this.service.generateScript(nodeId, request, identity)
  }

  @Delete(`${ROUTE_NODE_ID}/script`)
  @HttpCode(204)
  @ApiOperation({
    description: 'Request must include `nodeId`.',
    summary: 'Delete node set up install script.',
  })
  @ApiNoContentResponse({ description: 'Agent install script deleted.' })
  async discardScript(@NodeId() nodeId: string): Promise<void> {
    return await this.service.discardScript(nodeId)
  }

  @Get(`${ROUTE_NODE_ID}/script`)
  @ApiProduces('text/plain')
  @ApiOperation({
    description:
      'Request must include `nodeId`. Response should include `type`, `status`, `description`, `icon`, `address`, `connectedAt` date, `version`, `updating`, `id`, `name`, `hasToken`, and `install` details.',
    summary: 'Fetch install script.',
  })
  @ApiOkResponse({ type: NodeDetailsDto, description: 'Install script listed.' })
  @Header('content-type', 'text/plain')
  @DisableAuth()
  @UuidParams(PARAM_NODE_ID)
  async getScript(@NodeId(NodeGetScriptValidationPipe) nodeId: string): Promise<string> {
    return await this.service.getScript(nodeId)
  }

  @Delete(`${ROUTE_NODE_ID}/token`)
  @HttpCode(204)
  @ApiOperation({
    description: 'Request must include `nodeId`.',
    summary: "Revoke token that belongs to a node's install script.",
  })
  @ApiNoContentResponse({ description: 'Token revoked.' })
  @UuidParams(PARAM_NODE_ID)
  async revokeToken(@NodeId() nodeId: string, @IdentityFromRequest() identity: Identity): Promise<void> {
    return await this.service.revokeToken(nodeId, identity)
  }

  @Post(`${ROUTE_NODE_ID}/update`)
  @HttpCode(204)
  @ApiOperation({
    description: 'Request must include `nodeId`.',
    summary: "Update node's data.",
  })
  @ApiNoContentResponse({ description: 'Node details modified.' })
  @UuidParams(PARAM_NODE_ID)
  async updateNodeAgent(@NodeId() nodeId: string): Promise<void> {
    this.service.updateNodeAgent(nodeId)
  }

  @Get(`${ROUTE_NODE_ID}/container`)
  @HttpCode(200)
  @ApiOperation({
    description:
      'Request must include `nodeId` and `prefix`. Response should include `id`, `command`, `createdAt`, `state`, `status`, `imageName`, `imageTag` and `ports` of images.',
    summary: 'Fetch data of containers running on a node.',
  })
  @ApiOkResponse({ type: ContainerStatus, isArray: true, description: 'Fetch data of containers running on a node.' })
  @UuidParams(PARAM_NODE_ID)
  async getContainerStatus(@NodeId() nodeId: string, @Query('prefix') prefix: string): Promise<Observable<any>> {
    return this.service.handleWatchContainerStatusDto(nodeId, prefix).pipe(timeout(5000))
  }
}
