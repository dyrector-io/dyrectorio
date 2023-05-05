import { Body, Controller, Delete, Get, Header, HttpCode, Post, Put, UseGuards } from '@nestjs/common'
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import UuidParams from 'src/decorators/api-params.decorator'
import { CreatedResponse, CreatedWithLocation } from '../shared/created-with-location.decorator'
import { DisableAuth, IdentityFromRequest } from '../token/jwt-auth.guard'
import NodeTeamAccessGuard from './guards/node.team-access.http.guard'
import { NodeId, PARAM_NODE_ID, ROUTE_NODES, ROUTE_NODE_ID } from './node.const'
import {
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
@UseGuards(NodeTeamAccessGuard)
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
  @ApiOkResponse({ type: NodeDetailsDto, description: 'Data of the node.' })
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
  @ApiOkResponse({ type: String })
  @ApiProduces('text/plain')
  @ApiOperation({
    description:
      'Request must include `nodeId`. Response should include `type`, `status`, `description`, `icon`, `address`, `connectedAt` date, `version`, `updating`, `id`, `name`, `hasToken`, and `install` details.',
    summary: 'Fetch install script.',
  })
  @ApiOkResponse({ type: NodeDetailsDto, description: 'Install script.' })
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
    summary: "Revoke the node's access token.",
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
  updateNodeAgent(@NodeId() nodeId: string) {
    this.service.updateAgent(nodeId)
  }
}
