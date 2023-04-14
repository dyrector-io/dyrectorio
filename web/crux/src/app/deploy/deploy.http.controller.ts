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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import { CreatedResponse, CreatedWithLocation } from '../shared/created-with-location.decorator'
import CreatedWithLocationInterceptor from '../shared/created-with-location.interceptor'
import JwtAuthGuard, { IdentityFromRequest } from '../token/jwt-auth.guard'
import {
  CreateDeploymentDto,
  DeploymentDetailsDto,
  DeploymentDto,
  DeploymentEventDto,
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

const DeploymentId = () => Param('deploymentId')
const InstanceId = () => Param('instanceId')

const ROUTE_DEPLOYMENTS = 'deployments'
const ROUTE_DEPLOYMENT_ID = ':deploymentId'
const ROUTE_INSTANCES = 'instances'
const ROUTE_INSTANCE_ID = ':instanceId'

@Controller(ROUTE_DEPLOYMENTS)
@ApiTags(ROUTE_DEPLOYMENTS)
@UseGuards(JwtAuthGuard, DeployTeamAccessGuard)
@UsePipes(
  new ValidationPipe({
    // TODO(@robot9706): Move to global pipes after removing gRPC
    transform: true,
  }),
)
@UseInterceptors(HttpLoggerInterceptor, PrismaErrorInterceptor, CreatedWithLocationInterceptor)
export default class DeployHttpController {
  constructor(private service: DeployService) {}

  @Get()
  @ApiOkResponse({
    type: DeploymentDto,
    isArray: true,
  })
  async getDeployments(@IdentityFromRequest() identity: Identity): Promise<DeploymentDto[]> {
    return await this.service.getDeployments(identity)
  }

  @Get(ROUTE_DEPLOYMENT_ID)
  @HttpCode(200)
  @ApiOkResponse({ type: DeploymentDetailsDto })
  async getDeploymentDetails(@DeploymentId() deploymentId: string): Promise<DeploymentDetailsDto> {
    return await this.service.getDeploymentDetails(deploymentId)
  }

  @Get(`${ROUTE_DEPLOYMENT_ID}/events`)
  @HttpCode(200)
  @ApiOkResponse({ type: DeploymentEventDto, isArray: true })
  async getDeploymentEvents(@DeploymentId() deploymentId: string): Promise<DeploymentEventDto[]> {
    return await this.service.getDeploymentEvents(deploymentId)
  }

  @Get(`${ROUTE_DEPLOYMENT_ID}/${ROUTE_INSTANCES}/${ROUTE_INSTANCE_ID}`)
  @HttpCode(200)
  @ApiOkResponse({ type: InstanceDto })
  async getInstance(@DeploymentId() _deploymentId: string, @InstanceId() instanceId: string): Promise<InstanceDto> {
    return await this.service.getInstance(instanceId)
  }

  @Get(`${ROUTE_DEPLOYMENT_ID}/${ROUTE_INSTANCES}/${ROUTE_INSTANCE_ID}/secrets`)
  @HttpCode(200)
  @ApiOkResponse({ type: InstanceSecretsDto })
  async getDeploymentSecrets(
    @DeploymentId() _deploymentId: string,
    @InstanceId() instanceId: string,
  ): Promise<InstanceSecretsDto> {
    return await this.service.getInstanceSecrets(instanceId)
  }

  @Post()
  @HttpCode(201)
  @CreatedWithLocation()
  @ApiBody({ type: CreateDeploymentDto })
  @ApiCreatedResponse({ type: DeploymentDto })
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
  @UseInterceptors(DeployPatchValidationInterceptor)
  @ApiNoContentResponse()
  async patchDeployment(
    @DeploymentId() deploymentId: string,
    @Body() request: PatchDeploymentDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.patchDeployment(deploymentId, request, identity)
  }

  @Patch(`${ROUTE_DEPLOYMENT_ID}/${ROUTE_INSTANCES}/${ROUTE_INSTANCE_ID}`)
  @HttpCode(204)
  @UseInterceptors(DeployPatchValidationInterceptor)
  @ApiNoContentResponse()
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
  @UseInterceptors(DeleteDeploymentValidationInterceptor)
  async deleteDeployment(@DeploymentId() deploymentId: string): Promise<void> {
    await this.service.deleteDeployment(deploymentId)
  }

  @Post(`${ROUTE_DEPLOYMENT_ID}/start`)
  @HttpCode(204)
  @UseInterceptors(DeployStartValidationInterceptor)
  @ApiNoContentResponse()
  async startDeployment(
    @DeploymentId() deploymentId: string,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.startDeployment(deploymentId, identity)
  }

  @Post(`${ROUTE_DEPLOYMENT_ID}/copy`)
  @HttpCode(201)
  @CreatedWithLocation()
  @UseInterceptors(DeployCopyValidationInterceptor)
  @ApiCreatedResponse({ type: DeploymentDto })
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

  private static locationOf(deploymentId: string) {
    return `/${ROUTE_DEPLOYMENTS}/${deploymentId}`
  }
}
