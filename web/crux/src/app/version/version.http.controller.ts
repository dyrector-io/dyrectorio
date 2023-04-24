import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import UuidValidationGuard from 'src/guards/uuid-params.validation.guard'
import UuidParams from 'src/decorators/api-params.decorator'
import { CreatedResponse, CreatedWithLocation } from '../shared/created-with-location.decorator'
import CreatedWithLocationInterceptor from '../shared/created-with-location.interceptor'
import JwtAuthGuard, { IdentityFromRequest } from '../token/jwt-auth.guard'
import VersionTeamAccessGuard from './guards/version.team-access.guard'
import VersionCreateValidationInterceptor from './interceptors/version.create.interceptor'
import VersionDeleteValidationInterceptor from './interceptors/version.delete.interceptor'
import VersionIncreaseValidationInterceptor from './interceptors/version.increase.interceptor'
import VersionUpdateValidationInterceptor from './interceptors/version.update.interceptor'
import { CreateVersionDto, IncreaseVersionDto, UpdateVersionDto, VersionDetailsDto, VersionDto } from './version.dto'
import VersionService from './version.service'

const ROUTE_PRODUCTS = 'products'
const ROUTE_PRODUCT_ID = ':productId'
const ROUTE_VERSION_ID = ':versionId'
const ROUTE_VERSIONS = 'versions'

const ProductId = () => Param('productId')
const VersionId = () => Param('versionId')

@Controller(`${ROUTE_PRODUCTS}/${ROUTE_PRODUCT_ID}/${ROUTE_VERSIONS}`)
@ApiTags(ROUTE_VERSIONS)
@UseGuards(JwtAuthGuard, UuidValidationGuard, VersionTeamAccessGuard)
@UsePipes(
  new ValidationPipe({
    // TODO(@robot9706): Move to global pipes after removing gRPC
    transform: true,
  }),
)
@UseInterceptors(HttpLoggerInterceptor, PrismaErrorInterceptor, CreatedWithLocationInterceptor)
export default class VersionHttpController {
  constructor(private service: VersionService) {}

  @Get()
  @HttpCode(200)
  @ApiOkResponse({ type: VersionDto, isArray: true })
  @UuidParams('productId')
  async getVersions(@ProductId() productId: string, @IdentityFromRequest() identity: Identity): Promise<VersionDto[]> {
    return await this.service.getVersionsByProductId(productId, identity)
  }

  @Get(ROUTE_VERSION_ID)
  @ApiOkResponse({ type: VersionDetailsDto })
  async getVersion(@ProductId() _productId: string, @VersionId() versionId: string): Promise<VersionDetailsDto> {
    return await this.service.getVersionDetails(versionId)
  }

  @Post()
  @HttpCode(201)
  @CreatedWithLocation()
  @UseInterceptors(VersionCreateValidationInterceptor)
  @ApiBody({ type: CreateVersionDto })
  @ApiCreatedResponse({ type: VersionDto })
  @UuidParams('productId')
  async createVersion(
    @ProductId() productId: string,
    @Body() request: CreateVersionDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<VersionDto>> {
    const version = await this.service.createVersion(productId, request, identity)

    return {
      url: VersionHttpController.locationOf(productId, version.id),
      body: version,
    }
  }

  @Put(ROUTE_VERSION_ID)
  @HttpCode(204)
  @ApiNoContentResponse()
  @UseInterceptors(VersionUpdateValidationInterceptor)
  @ApiBody({ type: UpdateVersionDto })
  @UuidParams('versionId')
  async updateVersion(
    @ProductId() _productId: string,
    @VersionId() versionId: string,
    @Body() request: UpdateVersionDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    return await this.service.updateVersion(versionId, request, identity)
  }

  @Delete(ROUTE_VERSION_ID)
  @HttpCode(204)
  @ApiNoContentResponse()
  @UseInterceptors(VersionDeleteValidationInterceptor)
  @UuidParams('versionId')
  async deleteVersion(@ProductId() _productId: string, @VersionId() versionId: string): Promise<void> {
    return await this.service.deleteVersion(versionId)
  }

  @Put(`${ROUTE_VERSION_ID}/default`)
  @HttpCode(204)
  @ApiNoContentResponse()
  @UuidParams('productId')
  @UuidParams('versionId')
  async setDefaultVersion(@ProductId() productId: string, @VersionId() versionId: string): Promise<void> {
    return await this.service.setDefaultVersion(productId, versionId)
  }

  @Post(`${ROUTE_VERSION_ID}/increase`)
  @HttpCode(201)
  @CreatedWithLocation()
  @UseInterceptors(VersionIncreaseValidationInterceptor)
  @ApiBody({ type: IncreaseVersionDto })
  @ApiCreatedResponse({ type: VersionDto })
  @UuidParams('productId')
  @UuidParams('versionId')
  async increaseVersion(
    @ProductId() productId: string,
    @VersionId() versionId: string,
    @Body() request: IncreaseVersionDto,
    @IdentityFromRequest() identity,
  ): Promise<CreatedResponse<VersionDto>> {
    const version = await this.service.increaseVersion(versionId, request, identity)

    return {
      url: VersionHttpController.locationOf(productId, version.id),
      body: version,
    }
  }

  private static locationOf(productId: string, versionId: string) {
    return `/${ROUTE_PRODUCTS}/${productId}/${ROUTE_VERSIONS}/${versionId}`
  }
}
