import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
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
import { CreatedResponse, CreatedWithLocation } from '../../interceptors/created-with-location.decorator'
import { IdentityFromRequest } from '../token/jwt-auth.guard'
import VersionTeamAccessGuard from './guards/version.team-access.guard'
import VersionCreateValidationInterceptor from './interceptors/version.create.interceptor'
import VersionDeleteValidationInterceptor from './interceptors/version.delete.interceptor'
import VersionIncreaseValidationInterceptor from './interceptors/version.increase.interceptor'
import VersionUpdateValidationInterceptor from './interceptors/version.update.interceptor'
import {
  CreateVersionDto,
  IncreaseVersionDto,
  UpdateVersionDto,
  VersionDetailsDto,
  VersionDto,
  VersionListQuery,
} from './version.dto'
import VersionService from './version.service'

const PARAM_PROJECT_ID = 'projectId'
const PARAM_VERSION_ID = 'versionId'
const ProjectId = () => Param(PARAM_PROJECT_ID)
const VersionId = () => Param(PARAM_VERSION_ID)

const ROUTE_PROJECTS = 'projects'
const ROUTE_PROJECT_ID = ':projectId'
const ROUTE_VERSION_ID = ':versionId'
const ROUTE_VERSIONS = 'versions'

@Controller(`${ROUTE_PROJECTS}/${ROUTE_PROJECT_ID}/${ROUTE_VERSIONS}`)
@ApiTags(ROUTE_VERSIONS)
@UseGuards(VersionTeamAccessGuard)
export default class VersionHttpController {
  constructor(private service: VersionService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    description:
      "Returns an array containing the every version that belong to a project. `projectId` refers to the project's ID. Details include the version's `name`, `id`, `type`, `audit` log details, `changelog`, and increasibility.",
    summary: 'Fetch the list of all the versions under a project.',
  })
  @ApiOkResponse({
    type: VersionDto,
    isArray: true,
    description: 'Returns an array with the every version of a project.',
  })
  @UuidParams(PARAM_PROJECT_ID)
  async getVersions(
    @ProjectId() projectId: string,
    @IdentityFromRequest() identity: Identity,
    @Query() query: VersionListQuery,
  ): Promise<VersionDto[]> {
    return await this.service.getVersionsByProjectId(projectId, identity, query)
  }

  @Get(ROUTE_VERSION_ID)
  @ApiOperation({
    description:
      "Returns the details of a version in the project. `projectId` refers to the project's ID, `versionId` refers to the version's ID. Details include the version's `name`, `id`, `type`, `audit` log details, `changelog`, increasibility, mutability, deletability, and all image related data, including `name`, `id`, `tag`, `order` and configuration data of the images.",
    summary: 'Retrieve the details of a version of a project.',
  })
  @ApiOkResponse({ type: VersionDetailsDto, description: 'Details of a version under a project is fetched.' })
  @UuidParams(PARAM_PROJECT_ID, PARAM_VERSION_ID)
  async getVersion(@ProjectId() _projectId: string, @VersionId() versionId: string): Promise<VersionDetailsDto> {
    return await this.service.getVersionDetails(versionId)
  }

  @Post()
  @HttpCode(201)
  @CreatedWithLocation()
  @UseInterceptors(VersionCreateValidationInterceptor)
  @ApiOperation({
    description:
      "Creates a new version in a project. `projectId` refers to the project's ID. Request must include the `name` and `type` of the version, `changelog` is optionable. Response should include the `name`, `id`, `changelog`, increasibility, `type`, and `audit` log details of the version.",
    summary: 'Create a new version.',
  })
  @ApiBody({ type: CreateVersionDto })
  @ApiCreatedResponse({ type: VersionDto, description: 'New version created.' })
  @UuidParams(PARAM_PROJECT_ID)
  async createVersion(
    @ProjectId() projectId: string,
    @Body() request: CreateVersionDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<VersionDto>> {
    const version = await this.service.createVersion(projectId, request, identity)

    return {
      url: VersionHttpController.locationOf(projectId, version.id),
      body: version,
    }
  }

  @Put(ROUTE_VERSION_ID)
  @HttpCode(204)
  @ApiOperation({
    description:
      "Updates a version's `name` and `changelog`. `projectId` refers to the project's ID, `versionId` refers to the version's ID. Both are required variables.",
    summary: 'Modify version.',
  })
  @ApiNoContentResponse({ description: 'Changelog of a version is updated.' })
  @UseInterceptors(VersionUpdateValidationInterceptor)
  @ApiBody({ type: UpdateVersionDto })
  @UuidParams(PARAM_PROJECT_ID, PARAM_VERSION_ID)
  async updateVersion(
    @ProjectId() _projectId: string,
    @VersionId() versionId: string,
    @Body() request: UpdateVersionDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    return await this.service.updateVersion(versionId, request, identity)
  }

  @Delete(ROUTE_VERSION_ID)
  @HttpCode(204)
  @ApiOperation({
    description:
      "This call deletes a version. `projectId` refers to the project's ID, `versionId` refers to the version's ID. Both are required variables.",
    summary: 'Delete a version.',
  })
  @ApiNoContentResponse({ description: 'Version deleted.' })
  @UseInterceptors(VersionDeleteValidationInterceptor)
  @UuidParams(PARAM_PROJECT_ID, PARAM_VERSION_ID)
  async deleteVersion(@ProjectId() _projectId: string, @VersionId() versionId: string): Promise<void> {
    return await this.service.deleteVersion(versionId)
  }

  @Put(`${ROUTE_VERSION_ID}/default`)
  @HttpCode(204)
  @ApiOperation({
    description:
      "This call turns a version into the default one, resulting other versions within this project later inherit images, deployments and their configurations from it. `projectId` refers to the project's ID, `versionId` refers to the version's ID. Both are required variables.",
    summary:
      'Turn version into a default one of the complex project other versions under it will inherit images and deployments from.',
  })
  @ApiNoContentResponse({
    description: 'Version turned into default.',
  })
  @UuidParams(PARAM_PROJECT_ID, PARAM_VERSION_ID)
  async setDefaultVersion(@ProjectId() projectId: string, @VersionId() versionId: string): Promise<void> {
    return await this.service.setDefaultVersion(projectId, versionId)
  }

  @Post(`${ROUTE_VERSION_ID}/increase`)
  @HttpCode(201)
  @CreatedWithLocation()
  @ApiOperation({
    description:
      "Increases the version of a project with a new child version. `projectId` refers to the project's ID, `versionId` refers to the version's ID, `name` refers to the name of the new version. All are required variables.",
    summary: 'Increase a the version of a complex project with a new version.',
  })
  @UseInterceptors(VersionIncreaseValidationInterceptor)
  @ApiBody({ type: IncreaseVersionDto })
  @ApiCreatedResponse({ type: VersionDto, description: 'New version created.' })
  @UuidParams(PARAM_PROJECT_ID, PARAM_VERSION_ID)
  async increaseVersion(
    @ProjectId() projectId: string,
    @VersionId() versionId: string,
    @Body() request: IncreaseVersionDto,
    @IdentityFromRequest() identity,
  ): Promise<CreatedResponse<VersionDto>> {
    const version = await this.service.increaseVersion(versionId, request, identity)

    return {
      url: VersionHttpController.locationOf(projectId, version.id),
      body: version,
    }
  }

  private static locationOf(projectId: string, versionId: string) {
    return `/${ROUTE_PROJECTS}/${projectId}/${ROUTE_VERSIONS}/${versionId}`
  }
}
