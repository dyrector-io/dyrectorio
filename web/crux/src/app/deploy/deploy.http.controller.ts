import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
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
  ApiPreconditionFailedResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import UuidParams from 'src/decorators/api-params.decorator'
import { CreatedResponse, CreatedWithLocation } from '../../interceptors/created-with-location.decorator'
import { AuthStrategy, IdentityFromRequest } from '../token/jwt-auth.guard'
import {
  CopyDeploymentDto,
  CreateDeploymentDto,
  CreateDeploymentTokenDto,
  DeploymentDetailsDto,
  DeploymentDto,
  DeploymentLogListDto,
  DeploymentLogPaginationQuery,
  DeploymentTokenCreatedDto,
  InstanceDto,
  InstanceSecretsDto,
  PatchDeploymentDto,
  PatchInstanceDto,
  StartDeploymentDto,
} from './deploy.dto'
import DeployService from './deploy.service'
import DeployCreateTeamAccessGuard from './guards/deploy.create.team-access.guard'
import DeployJwtAuthGuard from './guards/deploy.jwt-auth.guard'
import DeployTeamAccessGuard from './guards/deploy.team-access.guard'
import DeployCopyValidationInterceptor from './interceptors/deploy.copy.interceptor'
import DeployCreateValidationInterceptor from './interceptors/deploy.create.interceptor'
import DeleteDeploymentValidationInterceptor from './interceptors/deploy.delete.interceptor'
import DeployPatchValidationInterceptor from './interceptors/deploy.patch.interceptor'
import DeployStartValidationInterceptor from './interceptors/deploy.start.interceptor'
import DeployCreateDeployTokenValidationInterceptor from './interceptors/deploy.create-deploy-token.interceptor'

const PARAM_DEPLOYMENT_ID = 'deploymentId'
const PARAM_INSTANCE_ID = 'instanceId'
const DeploymentId = () => Param(PARAM_DEPLOYMENT_ID)
const InstanceId = () => Param(PARAM_INSTANCE_ID)

const ROUTE_DEPLOYMENTS = 'deployments'
const ROUTE_DEPLOYMENT_ID = ':deploymentId'
const ROUTE_INSTANCES = 'instances'
const ROUTE_INSTANCE_ID = ':instanceId'
const ROUTE_TOKEN = 'token'

@Controller(ROUTE_DEPLOYMENTS)
@ApiTags(ROUTE_DEPLOYMENTS)
@UseGuards(DeployJwtAuthGuard, DeployTeamAccessGuard)
export default class DeployHttpController {
  constructor(private service: DeployService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description:
      'Get the list of deployments. A deployment should include `id`, `prefix`, `status`, `note`, `audit` log details, project `name`, `id`, `type`, version `name`, `type`, `id`, and node `name`, `id`, `type`.',
    summary: 'Fetch the list of deployments.',
  })
  @ApiOkResponse({
    type: DeploymentDto,
    isArray: true,
    description: 'List of deployments.',
  })
  @ApiForbiddenResponse({ description: 'Unauthorized request for deployments.' })
  async getDeployments(@IdentityFromRequest() identity: Identity): Promise<DeploymentDto[]> {
    return await this.service.getDeployments(identity)
  }

  @Get(ROUTE_DEPLOYMENT_ID)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description:
      'Get details of a certain deployment. Request must include `deploymentId`. Deployment details should include `id`, `prefix`, `environment`, `status`, `note`, `audit` log details, project `name`, `id`, `type`, version `name`, `type`, `id`, and node `name`, `id`, `type`.',
    summary: 'Retrieve details of a deployment.',
  })
  @ApiOkResponse({ type: DeploymentDetailsDto, description: 'Details of a deployment.' })
  @ApiBadRequestResponse({ description: 'Bad request for deployment details.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for deployment details.' })
  @ApiNotFoundResponse({ description: 'Deployment not found.' })
  @UuidParams(PARAM_DEPLOYMENT_ID)
  async getDeploymentDetails(@DeploymentId() deploymentId: string): Promise<DeploymentDetailsDto> {
    return await this.service.getDeploymentDetails(deploymentId)
  }

  @Get(`${ROUTE_DEPLOYMENT_ID}/${ROUTE_INSTANCES}/${ROUTE_INSTANCE_ID}`)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description:
      'Request must include `deploymentId` and `instanceId`, which refer to the ID of a deployment and the instance. Instances are the manifestation of an image in the deployment. Response should include `state`, `id`, `updatedAt`, and `image` details including `id`, `name`, `tag`, `order` and `config` variables.',
    summary: 'Get details of a soon-to-be container.',
  })
  @ApiOkResponse({ type: InstanceDto, description: 'Details of an instance.' })
  @ApiBadRequestResponse({ description: 'Bad request for instance details.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for an instance.' })
  @ApiNotFoundResponse({ description: 'Instance not found.' })
  @UuidParams(PARAM_DEPLOYMENT_ID, PARAM_INSTANCE_ID)
  async getInstance(@DeploymentId() _deploymentId: string, @InstanceId() instanceId: string): Promise<InstanceDto> {
    return await this.service.getInstance(instanceId)
  }

  @Get(`${ROUTE_DEPLOYMENT_ID}/${ROUTE_INSTANCES}/${ROUTE_INSTANCE_ID}/secrets`)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description:
      'Request must include `deploymentId` and `instanceId`, which refers to the ID of a deployment and the instance. Response should include container `prefix` and `name`, and `publicKey`, `keys`.',
    summary: 'Fetch secrets of a soon-to-be container.',
  })
  @ApiOkResponse({ type: InstanceSecretsDto, description: 'Secrets of an instance listed.' })
  @ApiBadRequestResponse({ description: 'Bad request for instance secrets.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for instance secrets.' })
  @ApiNotFoundResponse({ description: 'Instance secrets not found.' })
  @UuidParams(PARAM_DEPLOYMENT_ID, PARAM_INSTANCE_ID)
  async getDeploymentSecrets(
    @DeploymentId() _deploymentId: string,
    @InstanceId() instanceId: string,
  ): Promise<InstanceSecretsDto> {
    return await this.service.getInstanceSecrets(instanceId)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    description:
      'Request must include `versionId`, `nodeId`, and `prefix`, which refers to the ID of a version, a node and the prefix of the deployment. Response should include deployment `id`, `prefix`, `status`, `note`, and `audit` log details, as well as project `type`, `id`, `name`, version `type`, `id`, `name`, and node `type`, `id`, `name`.',
    summary: 'Create new deployment.',
  })
  @CreatedWithLocation()
  @ApiBody({ type: CreateDeploymentDto })
  @ApiCreatedResponse({ type: DeploymentDto, description: 'New deployment created.' })
  @ApiBadRequestResponse({ description: 'Bad request for a deployment.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for a deployment.' })
  @ApiConflictResponse({ description: 'Prefix taken for the node.' })
  @UseGuards(DeployCreateTeamAccessGuard)
  @UseInterceptors(DeployCreateValidationInterceptor)
  async createDeployment(
    @Body() request: CreateDeploymentDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<DeploymentDto>> {
    const deployment = await this.service.createDeployment(request, identity)

    return {
      url: DeployHttpController.locationOf(deployment.id),
      body: deployment,
    }
  }

  @Patch(ROUTE_DEPLOYMENT_ID)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Request must include `deploymentId`.',
    summary: 'Update deployment.',
  })
  @UseInterceptors(DeployPatchValidationInterceptor)
  @ApiNoContentResponse({ description: 'Deployment modified.' })
  @ApiBadRequestResponse({ description: 'Bad request for a deployment.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for a deployment.' })
  @ApiNotFoundResponse({ description: 'Deployment not found.' })
  @UuidParams(PARAM_DEPLOYMENT_ID)
  async patchDeployment(
    @DeploymentId() deploymentId: string,
    @Body() request: PatchDeploymentDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.patchDeployment(deploymentId, request, identity)
  }

  @Patch(`${ROUTE_DEPLOYMENT_ID}/${ROUTE_INSTANCES}/${ROUTE_INSTANCE_ID}`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description:
      'Request must include `deploymentId` and `instanceId` and portion of the instance configuration as `config`. Response should include `config` variables in an array.',
    summary: 'Update instance configuration.',
  })
  @UseInterceptors(DeployPatchValidationInterceptor)
  @ApiNoContentResponse({ description: 'Instance configuration updated.' })
  @ApiBadRequestResponse({ description: 'Bad request for an instance.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for an instance.' })
  @ApiNotFoundResponse({ description: 'Instance not found.' })
  @UuidParams(PARAM_DEPLOYMENT_ID, PARAM_INSTANCE_ID)
  async patchInstance(
    @DeploymentId() deploymentId: string,
    @InstanceId() instanceId: string,
    @Body() request: PatchInstanceDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.patchInstance(deploymentId, instanceId, request, identity)
  }

  @Delete(ROUTE_DEPLOYMENT_ID)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Request must include `deploymentId`.',
    summary: 'Delete deployment.',
  })
  @UseInterceptors(DeleteDeploymentValidationInterceptor)
  @ApiNoContentResponse({ description: 'Deployment deleted.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for a deployment.' })
  @ApiNotFoundResponse({ description: 'Deployment not found.' })
  @UuidParams(PARAM_DEPLOYMENT_ID)
  async deleteDeployment(@DeploymentId() deploymentId: string): Promise<void> {
    await this.service.deleteDeployment(deploymentId)
  }

  @Post(`${ROUTE_DEPLOYMENT_ID}/start`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Request must include `deploymentId`.',
    summary: 'Start the deployment process.',
  })
  @UseInterceptors(DeployStartValidationInterceptor)
  @ApiNoContentResponse({ description: 'Deployment initiated.' })
  @ApiBadRequestResponse({ description: 'Bad request for a deployment.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for a deployment.' })
  @UuidParams(PARAM_DEPLOYMENT_ID)
  @AuthStrategy('deploy-token')
  async startDeployment(
    @DeploymentId() deploymentId: string,
    @IdentityFromRequest() identity: Identity,
    @Body() request: StartDeploymentDto,
  ): Promise<void> {
    await this.service.startDeployment(deploymentId, identity, request.instances)
  }

  @Post(`${ROUTE_DEPLOYMENT_ID}/copy`)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    description:
      'Request must include `deploymentId`, which will be copied. The body must include the `nodeId`, `prefix` and optionally a `note`. Response should include deployment data: `id`, `prefix`, `status`, `note`, and miscellaneous details of `audit` log, `project`, `version`, and `node`.',
    summary: 'Copy deployment.',
  })
  @CreatedWithLocation()
  @ApiCreatedResponse({ type: DeploymentDto, description: 'Deployment copied.' })
  @ApiConflictResponse({ description: 'Prefix taken for the node.' })
  @ApiBadRequestResponse({ description: 'Bad request for a deployment.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for a deployment.' })
  @UseInterceptors(DeployCopyValidationInterceptor)
  @UuidParams(PARAM_DEPLOYMENT_ID)
  async copyDeployment(
    @DeploymentId() deploymentId: string,
    @Body() request: CopyDeploymentDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<DeploymentDto>> {
    const deployment = await this.service.copyDeployment(deploymentId, request, identity)

    return {
      url: DeployHttpController.locationOf(deployment.id),
      body: deployment,
    }
  }

  @Get(`${ROUTE_DEPLOYMENT_ID}/log`)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description:
      'Request must include `deploymentId`. Response should include an `items` array with objects of `type`, `deploymentStatus`, `createdAt`, `log`, and `containerState` which consists of `state` and `instanceId`.',
    summary: 'Fetch event log of a deployment.',
  })
  @ApiOkResponse({ type: DeploymentLogListDto, description: 'Deployment event log.' })
  @ApiBadRequestResponse({ description: 'Bad request for a deployment log.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for a deployment log.' })
  @ApiNotFoundResponse({ description: 'Deployment log not found.' })
  @UuidParams(PARAM_DEPLOYMENT_ID)
  async deploymentLog(
    @DeploymentId() deploymentId: string,
    @Query() query: DeploymentLogPaginationQuery,
  ): Promise<DeploymentLogListDto> {
    return this.service.getDeploymentLog(deploymentId, query)
  }

  @Put(`${ROUTE_DEPLOYMENT_ID}/${ROUTE_TOKEN}`)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    description:
      'Request must include `deploymentId` in the url. In the body a `name` and optionally the expiration date as `expirationInDays`.',
    summary: 'Create deployment token.',
  })
  @CreatedWithLocation()
  @ApiOkResponse({ type: DeploymentTokenCreatedDto, description: 'Deployment token with jwt and the curl command.' })
  @ApiBadRequestResponse({ description: 'Bad request for a deployment token.' })
  @ApiConflictResponse({ description: 'Token name taken.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for a deployment token.' })
  @UuidParams(PARAM_DEPLOYMENT_ID)
  @UseInterceptors(DeployCreateDeployTokenValidationInterceptor)
  async createDeploymentToken(
    @DeploymentId() deploymentId: string,
    @Body() request: CreateDeploymentTokenDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<DeploymentTokenCreatedDto>> {
    const token = await this.service.createDeploymentToken(deploymentId, request, identity)

    return {
      url: `${DeployHttpController.locationOf(deploymentId)}/${ROUTE_TOKEN}`,
      body: token,
    }
  }

  @Delete(`${ROUTE_DEPLOYMENT_ID}/${ROUTE_TOKEN}`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Request must include the `deploymentId`.',
    summary: 'Delete deployment token.',
  })
  @ApiNoContentResponse({ description: 'Deployment token deleted.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for a deployment token.' })
  @ApiNotFoundResponse({ description: 'Deployment token not found.' })
  @UuidParams(PARAM_DEPLOYMENT_ID)
  async deleteDeploymentToken(@DeploymentId() deploymentId: string): Promise<void> {
    await this.service.deleteDeploymentToken(deploymentId)
  }

  private static locationOf(deploymentId: string) {
    return `/${ROUTE_DEPLOYMENTS}/${deploymentId}`
  }
}
