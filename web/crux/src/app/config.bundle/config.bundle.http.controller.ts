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
  ApiTags,
} from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import UuidParams from 'src/decorators/api-params.decorator'
import { CreatedResponse, CreatedWithLocation } from '../../interceptors/created-with-location.decorator'
import { DeploymentDto } from '../deploy/deploy.dto'
import DeployService from '../deploy/deploy.service'
import { IdentityFromRequest } from '../token/jwt-auth.guard'
import {
  ConfigBundleDetailsDto,
  ConfigBundleDto,
  CreateConfigBundleDto,
  PatchConfigBundleDto,
} from './config.bundle.dto'
import ConfigBundleService from './config.bundle.service'
import ConfigBundleTeamAccessGuard from './guards/config.bundle.team-access.guard'
import ConfigBundleDeleteValidationInterceptor from './interceptors/config.bundle.delete.interceptor'

const PARAM_TEAM_SLUG = 'teamSlug'
const PARAM_CONFIG_BUNDLE_ID = 'configBundleId'
const TeamSlug = () => Param(PARAM_TEAM_SLUG)
const ConfigBundleId = () => Param(PARAM_CONFIG_BUNDLE_ID)

const ROUTE_TEAM_SLUG = ':teamSlug'
const ROUTE_CONFIG_BUNDLES = 'config-bundles'
const ROUTE_CONFIG_BUNDLE_ID = ':configBundleId'

@Controller(`${ROUTE_TEAM_SLUG}/${ROUTE_CONFIG_BUNDLES}`)
@ApiTags(ROUTE_CONFIG_BUNDLES)
@UseGuards(ConfigBundleTeamAccessGuard)
export default class ConfigBundlesHttpController {
  constructor(
    private readonly service: ConfigBundleService,
    private readonly deployService: DeployService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: 'Response should include `id` and `name`.',
    summary: 'Fetch the list of config bundles.',
  })
  @ApiOkResponse({
    type: ConfigBundleDto,
    isArray: true,
    description: 'List of config bundles.',
  })
  @ApiForbiddenResponse({ description: 'Unauthorized request for config bundles.' })
  async getConfigBundles(@TeamSlug() teamSlug: string): Promise<ConfigBundleDto[]> {
    return this.service.getConfigBundles(teamSlug)
  }

  @Get(ROUTE_CONFIG_BUNDLE_ID)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description:
      'Get the details of a config bundle. Request must include `configBundleId`. Response should include description, icon, url, `id`, `name` and `environment`.',
    summary: 'Return details of a config bundle.',
  })
  @ApiOkResponse({ type: ConfigBundleDetailsDto, description: 'Config bundle details.' })
  @ApiBadRequestResponse({ description: 'Bad request for config bundle details.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for config bundle details.' })
  @ApiNotFoundResponse({ description: 'Config bundle not found.' })
  @UuidParams(PARAM_CONFIG_BUNDLE_ID)
  async getConfigBundleDetails(@TeamSlug() _: string, @ConfigBundleId() id: string): Promise<ConfigBundleDetailsDto> {
    return this.service.getConfigBundleDetails(id)
  }

  @Get(`${ROUTE_CONFIG_BUNDLE_ID}/deployments`)
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
  async getDeployments(
    @TeamSlug() teamSlug: string,
    @ConfigBundleId() configBundleId: string,
  ): Promise<DeploymentDto[]> {
    const deployments = await this.deployService.getDeploymentsByConfigBundleId(configBundleId)

    return deployments
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    description: 'Creates a new config bundle. Request must include `name`.',
    summary: 'Create a new config bundle.',
  })
  @CreatedWithLocation()
  @ApiBody({ type: CreateConfigBundleDto })
  @ApiCreatedResponse({ type: CreateConfigBundleDto, description: 'New config bundle created.' })
  @ApiBadRequestResponse({ description: 'Bad request for config bundle creation.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for config bundle creation.' })
  @ApiConflictResponse({ description: 'Config bundle name taken.' })
  async createConfigBundle(
    @TeamSlug() teamSlug: string,
    @Body() request: CreateConfigBundleDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<ConfigBundleDetailsDto>> {
    const configBundle = await this.service.createConfigBundle(teamSlug, request, identity)

    return {
      url: `${ROUTE_TEAM_SLUG}/${ROUTE_CONFIG_BUNDLES}/${configBundle.id}`,
      body: configBundle,
    }
  }

  @Patch(ROUTE_CONFIG_BUNDLE_ID)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Updates a config bundle.',
    summary: 'Modify a config bundle.',
  })
  @ApiNoContentResponse({ description: 'Config bundle updated.' })
  @ApiBadRequestResponse({ description: 'Bad request for config bundle update.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for config bundle update.' })
  @ApiNotFoundResponse({ description: 'Config bundle not found.' })
  @ApiConflictResponse({ description: 'Config bundle name taken.' })
  @UuidParams(PARAM_CONFIG_BUNDLE_ID)
  async patchConfigBundle(
    @TeamSlug() _: string,
    @ConfigBundleId() id: string,
    @Body() request: PatchConfigBundleDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.patchConfigBundle(id, request, identity)
  }

  @Delete(ROUTE_CONFIG_BUNDLE_ID)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Deletes a config bundle. Request must include `configBundleId`.',
    summary: 'Delete a config bundle from dyrector.io.',
  })
  @UseInterceptors(ConfigBundleDeleteValidationInterceptor)
  @ApiNoContentResponse({ description: 'Config bundle deleted.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for config bundle delete.' })
  @ApiNotFoundResponse({ description: 'Config bundle not found.' })
  @UuidParams(PARAM_CONFIG_BUNDLE_ID)
  async deleteConfigBundle(@TeamSlug() _: string, @ConfigBundleId() id: string): Promise<void> {
    return this.service.deleteConfigBundle(id)
  }
}
