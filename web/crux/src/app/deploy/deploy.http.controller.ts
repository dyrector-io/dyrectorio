import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import UuidParams from 'src/decorators/api-params.decorator'
import { CreatedResponse, CreatedWithLocation } from '../shared/created-with-location.decorator'
import { IdentityFromRequest } from '../token/jwt-auth.guard'
import {
  CreateDeploymentDto,
  DeploymentDetailsDto,
  DeploymentDto,
  DeploymentLogListDto,
  DeploymentLogPaginationQuery,
  InstanceDto,
  InstanceSecretsDto,
  PatchDeploymentDto,
  PatchInstanceDto,
} from './deploy.dto'
import DeployService from './deploy.service'
import DeployCreateTeamAccessGuard from './guards/deploy.create.team-access.guard'
import DeployTeamAccessGuard from './guards/deploy.team-access.guard'
import DeployCopyValidationInterceptor from './interceptors/deploy.copy.interceptor'
import DeployCreateValidationInterceptor from './interceptors/deploy.create.interceptor'
import DeleteDeploymentValidationInterceptor from './interceptors/deploy.delete.interceptor'
import DeployPatchValidationInterceptor from './interceptors/deploy.patch.interceptor'
import DeployStartValidationInterceptor from './interceptors/deploy.start.interceptor'

const PARAM_DEPLOYMENT_ID = 'deploymentId'
const PARAM_INSTANCE_ID = 'instanceId'
const DeploymentId = () => Param(PARAM_DEPLOYMENT_ID)
const InstanceId = () => Param(PARAM_INSTANCE_ID)

const ROUTE_DEPLOYMENTS = 'deployments'
const ROUTE_DEPLOYMENT_ID = ':deploymentId'
const ROUTE_INSTANCES = 'instances'
const ROUTE_INSTANCE_ID = ':instanceId'

@Controller(ROUTE_DEPLOYMENTS)
@ApiTags(ROUTE_DEPLOYMENTS)
@UseGuards(DeployTeamAccessGuard)
export default class DeployHttpController {
  constructor(private service: DeployService) {}

  @Get()
  @ApiOperation({
    description:
      'Get the list of deployments. A deployment should include `id`, `prefix`, `status`, `note`, `audit` log details, product `name`, `id`, `type`, version `name`, `type`, `id`, and node `name`, `id`, `type`.',
    summary: 'Fetch the list of deployments.',
  })
  @ApiOkResponse({
    type: DeploymentDto,
    isArray: true,
    description: 'List of deployments.',
  })
  async getDeployments(@IdentityFromRequest() identity: Identity): Promise<DeploymentDto[]> {
    return await this.service.getDeployments(identity)
  }

  @Get(ROUTE_DEPLOYMENT_ID)
  @HttpCode(200)
  @ApiOperation({
    description:
      'Get details of a certain deployment. Request must include `deploymentId`. Deployment details should include `id`, `prefix`, `environment`, `status`, `note`, `audit` log details, product `name`, `id`, `type`, version `name`, `type`, `id`, and node `name`, `id`, `type`.',
    summary: 'Retrieve details of a deployment.',
  })
  @ApiOkResponse({ type: DeploymentDetailsDto, description: 'Details of a deployment.' })
  @UuidParams(PARAM_DEPLOYMENT_ID)
  async getDeploymentDetails(@DeploymentId() deploymentId: string): Promise<DeploymentDetailsDto> {
    return await this.service.getDeploymentDetails(deploymentId)
  }

  @Get(`${ROUTE_DEPLOYMENT_ID}/${ROUTE_INSTANCES}/${ROUTE_INSTANCE_ID}`)
  @HttpCode(200)
  @ApiOperation({
    description:
      'Request must include `deploymentId` and `instanceId`, which refer to the ID of a deployment and the instance. Instances are the manifestation of an image in the deployment. Response should include `state`, `id`, `updatedAt`, and `image` details including `id`, `name`, `tag`, `order` and `config` variables.',
    summary: 'Get details of a soon-to-be container.',
  })
  @ApiOkResponse({ type: InstanceDto, description: 'Details of an instance.' })
  @UuidParams(PARAM_DEPLOYMENT_ID, PARAM_INSTANCE_ID)
  async getInstance(@DeploymentId() _deploymentId: string, @InstanceId() instanceId: string): Promise<InstanceDto> {
    return await this.service.getInstance(instanceId)
  }

  @Get(`${ROUTE_DEPLOYMENT_ID}/${ROUTE_INSTANCES}/${ROUTE_INSTANCE_ID}/secrets`)
  @HttpCode(200)
  @ApiOperation({
    description:
      'Request must include `deploymentId` and `instanceId`, which refers to the ID of a deployment and the instance. Response should include container `prefix` and `name`, and `publicKey`, `keys`.',
    summary: 'Fetch secrets of a soon-to-be container.',
  })
  @ApiOkResponse({ type: InstanceSecretsDto, description: 'Secrets of an instance listed.' })
  @UuidParams(PARAM_DEPLOYMENT_ID, PARAM_INSTANCE_ID)
  async getDeploymentSecrets(
    @DeploymentId() _deploymentId: string,
    @InstanceId() instanceId: string,
  ): Promise<InstanceSecretsDto> {
    return await this.service.getInstanceSecrets(instanceId)
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({
    description:
      'Request must include `versionId`, `nodeId`, and `prefix`, which refers to the ID of a version, a node and the prefix of the deployment. Response should include deployment `id`, `prefix`, `status`, `note`, and `audit` log details, as well as product `type`, `id`, `name`, version `type`, `id`, `name`, and node `type`, `id`, `name`.',
    summary: 'Create new deployment.',
  })
  @CreatedWithLocation()
  @ApiBody({ type: CreateDeploymentDto })
  @ApiCreatedResponse({ type: DeploymentDto, description: 'New deployment created.' })
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
  @HttpCode(204)
  @ApiOperation({
    description: 'Request must include `deploymentId`.',
    summary: 'Update deployment.',
  })
  @UseInterceptors(DeployPatchValidationInterceptor)
  @ApiNoContentResponse({ description: 'Deployment modified.' })
  @UuidParams(PARAM_DEPLOYMENT_ID)
  async patchDeployment(
    @DeploymentId() deploymentId: string,
    @Body() request: PatchDeploymentDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.patchDeployment(deploymentId, request, identity)
  }

  @Patch(`${ROUTE_DEPLOYMENT_ID}/${ROUTE_INSTANCES}/${ROUTE_INSTANCE_ID}`)
  @HttpCode(204)
  @ApiOperation({
    description:
      'Request must include `deploymentId` and `instanceId` and portion of the instance configuration as `config`. Response should include `config` variables in an array.',
    summary: 'Update instance configuration.',
  })
  @UseInterceptors(DeployPatchValidationInterceptor)
  @ApiNoContentResponse({ description: 'Instance configuration updated.' })
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
  @HttpCode(204)
  @ApiOperation({
    description: 'Request must include `deploymentId`.',
    summary: 'Delete deployment.',
  })
  @UseInterceptors(DeleteDeploymentValidationInterceptor)
  @ApiNoContentResponse({ description: 'Deployment deleted.' })
  @UuidParams(PARAM_DEPLOYMENT_ID)
  async deleteDeployment(@DeploymentId() deploymentId: string): Promise<void> {
    await this.service.deleteDeployment(deploymentId)
  }

  @Post(`${ROUTE_DEPLOYMENT_ID}/start`)
  @HttpCode(204)
  @ApiOperation({
    description: 'Request must include `deploymentId`.',
    summary: 'Start the deployment process.',
  })
  @UseInterceptors(DeployStartValidationInterceptor)
  @ApiNoContentResponse({ description: 'Deployment initiated.' })
  @UuidParams(PARAM_DEPLOYMENT_ID)
  async startDeployment(
    @DeploymentId() deploymentId: string,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.startDeployment(deploymentId, identity)
  }

  @Post(`${ROUTE_DEPLOYMENT_ID}/copy`)
  @HttpCode(201)
  @ApiOperation({
    description:
      'Request must include `deploymentId` and `force`, which is when true will overwrite the existing preparing deployment. Response should include deployment data: `id`, `prefix`, `status`, `note`, and miscellaneous details of `audit` log, `product`, `version`, and `node`.',
    summary: 'Copy deployment.',
  })
  @CreatedWithLocation()
  @ApiCreatedResponse({ type: DeploymentDto, description: 'Deployment copied.' })
  @UseInterceptors(DeployCopyValidationInterceptor)
  @UuidParams(PARAM_DEPLOYMENT_ID)
  async copyDeployment(
    @Query('force') _: boolean,
    @DeploymentId() deploymentId: string,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<DeploymentDto>> {
    const deployment = await this.service.copyDeployment(deploymentId, identity)
    return {
      url: DeployHttpController.locationOf(deployment.id),
      body: deployment,
    }
  }

  @Get(`${ROUTE_DEPLOYMENT_ID}/log`)
  @HttpCode(200)
  @ApiOperation({
    description:
      'Request must include `deploymentId`. Response should include an `items` array with objects of `type`, `deploymentStatus`, `createdAt`, `log`, and `containerState` which consists of `state` and `instanceId`.',
    summary: 'Fetch event log of a deployment.',
  })
  @ApiOkResponse({ type: DeploymentLogListDto, description: 'Deployment event log.' })
  @UuidParams(PARAM_DEPLOYMENT_ID)
  async deploymentLog(
    @DeploymentId() deploymentId: string,
    @Query() query: DeploymentLogPaginationQuery,
  ): Promise<DeploymentLogListDto> {
    return this.service.getDeploymentLog(deploymentId, query)
  }

  private static locationOf(deploymentId: string) {
    return `/${ROUTE_DEPLOYMENTS}/${deploymentId}`
  }
}
