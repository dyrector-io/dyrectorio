import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import UuidParams from 'src/decorators/api-params.decorator'
import { CreatedResponse, CreatedWithLocation } from '../../interceptors/created-with-location.decorator'
import { DeploymentDto } from '../deploy/deploy.dto'
import DeployService from '../deploy/deploy.service'
import { DisableAuth, IdentityFromRequest } from '../token/jwt-auth.guard'
import NodeTeamAccessGuard from './guards/node.team-access.http.guard'
import { NodeId, PARAM_NODE_ID, ROUTE_NODES, ROUTE_NODE_ID, ROUTE_TEAM_SLUG, TeamSlug } from './node.const'
import {
  CreateNodeDto,
  NodeAuditLogListDto,
  NodeAuditLogQueryDto,
  NodeDetailsDto,
  NodeDto,
  NodeGenerateScriptDto,
  NodeInstallDto,
  UpdateNodeDto,
} from './node.dto'
import NodeService from './node.service'
import DeleteNodeValidationPipe from './pipes/node.delete.pipe'
import NodeGenerateScriptValidationPipe from './pipes/node.generate-script.pipe'
import NodeGetScriptValidationPipe from './pipes/node.get-script.pipe'

@Controller(`${ROUTE_TEAM_SLUG}/${ROUTE_NODES}`)
@ApiTags(ROUTE_NODES)
@UseGuards(NodeTeamAccessGuard)
export default class NodeHttpController {
  constructor(
    private readonly service: NodeService,
    private readonly deployService: DeployService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description:
      "Fetch data of deployment targets. Request must include `teamSlug` in URL. Response should include an array with the node's `type`, `status`, `description`, `icon`, `address`, `connectedAt` date, `version`, `id`, and `name`.",
    summary: 'Get data of nodes that belong to your team.',
  })
  @ApiOkResponse({
    type: NodeDto,
    isArray: true,
    description: 'Data of nodes listed.',
  })
  @ApiForbiddenResponse({ description: 'Unauthorized request for nodes.' })
  async getNodes(@TeamSlug() teamSlug: string): Promise<NodeDto[]> {
    return this.service.getNodes(teamSlug)
  }

  @Get(ROUTE_NODE_ID)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description:
      "Fetch data of a specific node. Request must include `teamSlug` in URL, and `nodeId` in body. Response should include an array with the node's `type`, `status`, `description`, `icon`, `address`, `connectedAt` date, `version`, `updatable`, `id`, `name`, `hasToken`, and agent installation details.",
    summary: 'Get data of nodes that belong to your team.',
  })
  @ApiOkResponse({ type: NodeDetailsDto, description: 'Data of the node.' })
  @ApiBadRequestResponse({ description: 'Bad request for node details.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for node details.' })
  @ApiNotFoundResponse({ description: 'Node not found.' })
  @UuidParams(PARAM_NODE_ID)
  async getNodeDetails(@TeamSlug() _: string, @NodeId() nodeId: string): Promise<NodeDetailsDto> {
    return this.service.getNodeDetails(nodeId)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    description:
      "Request must include the `teamSlug` in URL, and node's `name` in body. Response should include an array with the node's `type`, `status`, `description`, `icon`, `address`, `connectedAt` date, `version`, `id`, and `name`.",
    summary: 'Create new node.',
  })
  @CreatedWithLocation()
  @ApiBody({ type: CreateNodeDto })
  @ApiCreatedResponse({ type: NodeDto, description: 'New node created.' })
  @ApiConflictResponse({ description: 'Node name taken.' })
  @ApiBadRequestResponse({ description: 'Bad request for node creation.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for node creation.' })
  async createNode(
    @TeamSlug() teamSlug: string,
    @Body() request: CreateNodeDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<NodeDto>> {
    const node = await this.service.createNode(teamSlug, request, identity)

    return {
      url: `${teamSlug}/${ROUTE_NODES}/${node.id}`,
      body: node,
    }
  }

  @Put(ROUTE_NODE_ID)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description:
      "Request must include the `teamSlug` in URL, and node's `name` in body, body can include `description` and `icon`.",
    summary: 'Update details of a node.',
  })
  @ApiNoContentResponse({ description: 'Node details modified.' })
  @ApiBadRequestResponse({ description: 'Bad request for node details.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for node details.' })
  @ApiNotFoundResponse({ description: 'Node not found.' })
  @ApiConflictResponse({ description: 'Node name taken.' })
  @UuidParams(PARAM_NODE_ID)
  async updateNode(
    @TeamSlug() _: string,
    @NodeId() id: string,
    @Body() request: UpdateNodeDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.updateNode(id, request, identity)
  }

  @Delete(ROUTE_NODE_ID)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: "Request must include the `teamSlug` in URL, and node's `name` in body.",
    summary: 'Delete node.',
  })
  @ApiNoContentResponse({ description: 'Node deleted.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for node delete.' })
  @ApiNotFoundResponse({ description: 'Node not found.' })
  @UuidParams(PARAM_NODE_ID)
  async deleteNode(
    @TeamSlug() _: string,
    @NodeId(DeleteNodeValidationPipe) nodeId: string,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    return this.service.deleteNode(nodeId, identity)
  }

  @Post(`${ROUTE_NODE_ID}/script`)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    description: 'Request must include `teamSlug` in URL and `nodeId`, `type`, and `scriptType`.',
    summary: 'Create agent install script.',
  })
  @ApiOkResponse({ type: NodeInstallDto, description: 'Install script generated.' })
  @ApiBadRequestResponse({ description: 'Bad request for an install script.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for an install script.' })
  @UuidParams(PARAM_NODE_ID)
  async generateScript(
    @TeamSlug() teamSlug: string,
    @NodeId(NodeGenerateScriptValidationPipe) nodeId: string,
    @Body() request: NodeGenerateScriptDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<NodeInstallDto> {
    return await this.service.generateScript(teamSlug, nodeId, request, identity)
  }

  @Delete(`${ROUTE_NODE_ID}/script`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: "Request must include the `teamSlug` in URL, and node's `name` in body.",
    summary: 'Delete node set up install script.',
  })
  @ApiNoContentResponse({ description: 'Agent install script deleted.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for script delete.' })
  @ApiNotFoundResponse({ description: 'Install script not found.' })
  async discardScript(@TeamSlug() _: string, @NodeId() nodeId: string): Promise<void> {
    return await this.service.discardScript(nodeId)
  }

  @Get(`${ROUTE_NODE_ID}/script`)
  @ApiOkResponse({ type: String })
  @ApiProduces('text/plain')
  @ApiOperation({
    description:
      "Request must include the `teamSlug` in URL, and node's `name` in body. Response should include `type`, `status`, `description`, `icon`, `address`, `connectedAt` date, `version`, `updatable`, `id`, `name`, `hasToken`, and `install` details.",
    summary: 'Fetch install script.',
  })
  @ApiOkResponse({ type: NodeDetailsDto, description: 'Install script.' })
  @ApiBadRequestResponse({ description: 'Bad request for an install script.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for an install script.' })
  @ApiNotFoundResponse({ description: 'Install script not found.' })
  @Header('content-type', 'text/plain')
  @DisableAuth()
  @UuidParams(PARAM_NODE_ID)
  async getScript(@TeamSlug() _: string, @NodeId(NodeGetScriptValidationPipe) nodeId: string): Promise<string> {
    return await this.service.getScript(nodeId)
  }

  @Delete(`${ROUTE_NODE_ID}/token`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: "Request must include the `teamSlug` in URL, and node's `name` in body.",
    summary: "Revoke the node's access token.",
  })
  @ApiNoContentResponse({ description: 'Token revoked.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for a token.' })
  @ApiNotFoundResponse({ description: 'Token not found.' })
  @UuidParams(PARAM_NODE_ID)
  async revokeToken(
    @TeamSlug() _: string,
    @NodeId() nodeId: string,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    return await this.service.revokeToken(nodeId, identity)
  }

  @Post(`${ROUTE_NODE_ID}/update`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: "Request must include the `teamSlug` in URL, and node's `name` in body.",
    summary: 'Update the agent.',
  })
  @ApiNoContentResponse({ description: 'Node details modified.' })
  @ApiBadRequestResponse({ description: 'Bad request for node details.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for node details.' })
  @UuidParams(PARAM_NODE_ID)
  async updateNodeAgent(@TeamSlug() _: string, @NodeId() nodeId: string, @IdentityFromRequest() identity: Identity) {
    await this.service.updateAgent(nodeId, identity)
  }

  @Get(`${ROUTE_NODE_ID}/audit`)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description:
      'Request must include `teamSlug` in URL, and its body must include `skip`, `take`, and dates of `from` and `to`. Response should include an array of `items`: `createdAt` date, `event`, and `data`.',
    summary: 'Fetch audit log.',
  })
  @ApiOkResponse({ type: NodeAuditLogListDto, description: 'Paginated list of the audit log.' })
  @ApiBadRequestResponse({ description: 'Bad request for audit log.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for audit log.' })
  @ApiNotFoundResponse({ description: 'Audit log not found.' })
  async getAuditLog(
    @TeamSlug() _: string,
    @NodeId() nodeId: string,
    @Query() query: NodeAuditLogQueryDto,
  ): Promise<NodeAuditLogListDto> {
    return await this.service.getAuditLog(nodeId, query)
  }

  @Get(`${ROUTE_NODE_ID}/deployments`)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description:
      'Get the list of deployments. Request needs to include `teamSlug` in URL. A deployment should include `id`, `prefix`, `status`, `note`, `audit` log details, project `name`, `id`, `type`, version `name`, `type`, `id`, and node `name`, `id`, `type`.',
    summary: 'Fetch the list of deployments.',
  })
  @ApiOkResponse({
    type: DeploymentDto,
    isArray: true,
    description: 'List of deployments.',
  })
  @ApiForbiddenResponse({ description: 'Unauthorized request for deployments.' })
  async getDeployments(@TeamSlug() teamSlug: string, @NodeId() nodeId: string): Promise<DeploymentDto[]> {
    const deployments = await this.deployService.getDeploymentsByNodeId(nodeId)

    return deployments
  }

  @Post(`${ROUTE_NODE_ID}/kick`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Request must include the `teamSlug` in URL.',
    summary: 'Kick the agent.',
  })
  @ApiBadRequestResponse({ description: 'Bad request for node kick.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for node kick.' })
  @UuidParams(PARAM_NODE_ID)
  async kickNodeAgent(@TeamSlug() _: string, @NodeId() nodeId: string, @IdentityFromRequest() identity: Identity) {
    await this.service.kickNode(nodeId, identity)
  }
}
