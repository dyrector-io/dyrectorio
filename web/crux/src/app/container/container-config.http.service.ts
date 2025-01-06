import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import UuidParams from 'src/decorators/api-params.decorator'
import { IdentityFromRequest } from '../token/jwt-auth.guard'
import ContainerConfigService from './container-config.service'
import { ContainerConfigDto, ContainerConfigRelationsDto, PatchContainerConfigDto } from './container.dto'
import ContainerConfigTeamAccessGuard from './guards/container-config.team-access.guard'

const PARAM_TEAM_SLUG = 'teamSlug'
const TeamSlug = () => Param(PARAM_TEAM_SLUG)
const PARAM_CONFIG_ID = 'configId'
const ConfigId = () => Param(PARAM_CONFIG_ID)

const ROUTE_TEAM_SLUG = ':teamSlug'
const ROUTE_CONTAINER_CONFIGS = 'container-configurations'
const ROUTE_CONFIG_ID = ':configId'

@Controller(`${ROUTE_TEAM_SLUG}/${ROUTE_CONTAINER_CONFIGS}`)
@ApiTags(ROUTE_CONTAINER_CONFIGS)
@UseGuards(ContainerConfigTeamAccessGuard)
export default class ContainerConfigHttpController {
  constructor(private service: ContainerConfigService) {}

  @Get(ROUTE_CONFIG_ID)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: 'Get details of a container configuration. Request must include `teamSlug` and `configId` in URL.',
    summary: 'Retrieve details of a container configuration.',
  })
  @ApiOkResponse({ type: ContainerConfigDto, description: 'Details of a container configuration.' })
  @ApiBadRequestResponse({ description: 'Bad request for container configuration details.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for container configuration details.' })
  @ApiNotFoundResponse({ description: 'Container configuration not found.' })
  @UuidParams(PARAM_CONFIG_ID)
  async getConfigDetails(@TeamSlug() _: string, @ConfigId() configId: string): Promise<ContainerConfigDto> {
    return await this.service.getConfigDetails(configId)
  }

  @Get(`${ROUTE_CONFIG_ID}/relations`)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description:
      'Get the relations of a container configuration. Request must include `teamSlug` and `configId` in URL.',
    summary: 'Retrieve the relations of a container configuration.',
  })
  @ApiOkResponse({ type: ContainerConfigRelationsDto, description: 'Relations of a container configuration.' })
  @ApiBadRequestResponse({ description: 'Bad request for container configuration relations.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for container configuration relations.' })
  @ApiNotFoundResponse({ description: 'Container configuration not found.' })
  @UuidParams(PARAM_CONFIG_ID)
  async getConfigRelations(@TeamSlug() _: string, @ConfigId() configId: string): Promise<ContainerConfigRelationsDto> {
    return await this.service.getConfigRelations(configId)
  }

  @Patch(ROUTE_CONFIG_ID)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Request must include `configId` and `teamSlug` in URL.',
    summary: 'Update container configuration.',
  })
  //   @UseInterceptors(DeployPatchValidationInterceptor)
  @ApiNoContentResponse({ description: 'Container configuration modified.' })
  @ApiBadRequestResponse({ description: 'Bad request for a container configuration.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for a container configuration.' })
  @ApiNotFoundResponse({ description: 'Container configuration not found.' })
  @UuidParams(PARAM_CONFIG_ID)
  async patchDeployment(
    @TeamSlug() _: string,
    @ConfigId() configId: string,
    @Body() request: PatchContainerConfigDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.patchConfig(configId, request, identity)
  }
}
