import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common'
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
import { CreatedResponse, CreatedWithLocation } from 'src/interceptors/created-with-location.decorator'
import { IdentityFromRequest } from '../token/jwt-auth.guard'
import PackageNodeAccessGuard from './guards/package.node-access.guard'
import PackageTeamAccessGuard from './guards/package.team-access.guard'
import PackageVersionAccessGuard from './guards/package.version-access.guard'
import {
  CreatePackageDto,
  CreatePackageEnvironmentDto,
  PackageDetailsDto,
  PackageDto,
  PackageEnvironmentDto,
  UpdatePackageDto,
  UpdatePackageEnvironmentDto,
} from './package.dto'
import PackageService from './package.service'

const PARAM_PACKAGE_ID = 'packageId'
const PackageId = () => Param(PARAM_PACKAGE_ID)

const PARAM_ENVIORNMENT_ID = 'environmentId'
const EnvironmentId = () => Param(PARAM_ENVIORNMENT_ID)

const ROUTE_PACKAGES = 'packages'
const ROUTE_PACKAGE_ID = ':packageId'
const ROUTE_ENVIRONMENTS = 'environments'
const ROUTE_ENVIRONMENT_ID = ':environmentId'

const ROUTE_TEAM_SLUG = ':teamSlug'
const PARAM_TEAM_SLUG = 'teamSlug'
const TeamSlug = () => Param(PARAM_TEAM_SLUG)

@Controller(`${ROUTE_TEAM_SLUG}/${ROUTE_PACKAGES}`)
@ApiTags(ROUTE_PACKAGES)
@UseGuards(PackageTeamAccessGuard)
class PackageHttpController {
  constructor(private readonly service: PackageService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: "Returns a list of a team's packages. `teamSlug` needs to be included in URL.",
    summary: 'Fetch the packages list.',
  })
  @ApiOkResponse({
    type: PackageDto,
    isArray: true,
    description: 'List of packages.',
  })
  @ApiForbiddenResponse({ description: 'Unauthorized request for packages.' })
  async getPackages(@TeamSlug() teamSlug: string): Promise<PackageDto[]> {
    return this.service.getPackages(teamSlug)
  }

  @Get(ROUTE_PACKAGE_ID)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description:
      "Returns a package's details. `teamSlug` and `packageId` needs to be included in URL. The response is consisting of the package's `name`, `id`, `description`, version chains and environment names.",
    summary: 'Fetch details of a package.',
  })
  @ApiOkResponse({ type: PackageDetailsDto, description: 'Details of a package.' })
  @ApiBadRequestResponse({ description: 'Bad request for package details.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for package details.' })
  @ApiNotFoundResponse({ description: 'Package not found.' })
  @UuidParams(PARAM_PACKAGE_ID)
  async getPackageDetails(@TeamSlug() _: string, @PackageId() id: string): Promise<PackageDetailsDto> {
    return this.service.getPackageById(id)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    description:
      'Create a new package for a team. `teamSlug` needs to be included in URL. Newly created package has a `name`, `versionChains` as required variables, and optionally a `description`.',
    summary: 'Create a new package for a team.',
  })
  @CreatedWithLocation()
  @ApiBody({ type: CreatePackageDto })
  @ApiCreatedResponse({ type: PackageDto, description: 'New package created.' })
  @ApiBadRequestResponse({ description: 'Bad request for package creation.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for package creation.' })
  @ApiConflictResponse({ description: 'Package name taken.' })
  @UseGuards(PackageVersionAccessGuard)
  async createPackage(
    @TeamSlug() teamSlug: string,
    @Body() request: CreatePackageDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<PackageDto>> {
    const pack = await this.service.createPackage(teamSlug, request, identity)

    return {
      url: `${teamSlug}/${ROUTE_PACKAGES}/${pack.id}`,
      body: pack,
    }
  }

  @Put(ROUTE_PACKAGE_ID)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description:
      'Updates a package. `teamSlug` is required in URL, as well as `packageId` to identify which package is modified, `name`, `description` and `versionChains` can be adjusted with this call.',
    summary: 'Update a package.',
  })
  @ApiNoContentResponse({ description: 'Package details are modified.' })
  @ApiBadRequestResponse({ description: 'Bad request for package details modification.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for package details modification.' })
  @ApiNotFoundResponse({ description: 'Package not found.' })
  @ApiConflictResponse({ description: 'Package name taken.' })
  @UseGuards(PackageVersionAccessGuard)
  @UuidParams(PARAM_PACKAGE_ID)
  async updatePackage(
    @TeamSlug() _: string,
    @PackageId() id: string,
    @Body() request: UpdatePackageDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.updatePackage(id, request, identity)
  }

  @Delete(ROUTE_PACKAGE_ID)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Deletes a package with the specified `packageId`. `teamSlug` and `packageId` are required in URL.',
    summary: 'Delete a package.',
  })
  @ApiNoContentResponse({ description: 'Package deleted.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for a package.' })
  @ApiNotFoundResponse({ description: 'Package not found.' })
  @UuidParams(PARAM_PACKAGE_ID)
  async deleteProject(@TeamSlug() _: string, @PackageId() id: string): Promise<void> {
    await this.service.deletePackage(id)
  }

  @Post(`${ROUTE_PACKAGE_ID}/${ROUTE_ENVIRONMENTS}`)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    description:
      'Create a new package environment. `teamSlug`, `packageId` needs to be included in URL. Newly created environment has a `name`, `nodeId` and `prefix` as required variables.',
    summary: 'Create a new package environment.',
  })
  @CreatedWithLocation()
  @ApiBody({ type: CreatePackageEnvironmentDto })
  @ApiCreatedResponse({ type: PackageEnvironmentDto, description: 'New package environment created.' })
  @ApiBadRequestResponse({ description: 'Bad request for package environment creation.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for package environment creation.' })
  @ApiConflictResponse({ description: 'Package environment name taken.' })
  @UseGuards(PackageNodeAccessGuard)
  async createPackageEnvironment(
    @TeamSlug() teamSlug: string,
    @Body() request: CreatePackageEnvironmentDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<PackageEnvironmentDto>> {
    const env = await this.service.createEnvironment(teamSlug, request, identity)

    return {
      url: `${teamSlug}/${ROUTE_PACKAGES}/${env.id}`,
      body: env,
    }
  }

  @Put(`${ROUTE_PACKAGE_ID}/${ROUTE_ENVIRONMENTS}/${ROUTE_ENVIRONMENT_ID}`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description:
      'Updates a package environment. `teamSlug` is required in URL, as well as `packageId` and `environmentId` to identify which environment is modified, `name`, `nodeId` and `prefix` can be adjusted with this call.',
    summary: 'Update a package environment.',
  })
  @ApiNoContentResponse({ description: 'Package environment is modified.' })
  @ApiBadRequestResponse({ description: 'Bad request for package environment modification.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for package environment modification.' })
  @ApiNotFoundResponse({ description: 'Package environment not found.' })
  @ApiConflictResponse({ description: 'Package environment name taken.' })
  @UseGuards(PackageNodeAccessGuard)
  @UuidParams(PARAM_PACKAGE_ID, PARAM_ENVIORNMENT_ID)
  async updatePackageEnvironment(
    @TeamSlug() _: string,
    @PackageId() packageId: string,
    @EnvironmentId() environmentId: string,
    @Body() request: UpdatePackageEnvironmentDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.updateEnviornment(packageId, environmentId, request, identity)
  }

  @Delete(`${ROUTE_PACKAGE_ID}/${ROUTE_ENVIRONMENTS}/${ROUTE_ENVIRONMENT_ID}`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description:
      'Deletes a package environment with the specified `packageId` and `environmentId`. `teamSlug`, `packageId` and `environmentId` are required in URL.',
    summary: 'Delete a package environment.',
  })
  @ApiNoContentResponse({ description: 'Package environment deleted.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for a package environment.' })
  @ApiNotFoundResponse({ description: 'Package environment not found.' })
  @UuidParams(PARAM_PACKAGE_ID)
  async deletePackageEnvironment(
    @TeamSlug() _: string,
    @PackageId() packageId: string,
    @EnvironmentId() environmentId: string,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.deleteEnvironment(packageId, environmentId, identity)
  }
}

export default PackageHttpController
