import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import HttpExceptionFilter from 'src/filters/http-exception.filter'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import { CreatedResponse, CreatedWithLocation } from '../shared/created-with-location.decorator'
import CreatedWithLocationInterceptor from '../shared/created-with-location.interceptor'
import JwtAuthGuard, { IdentityFromRequest } from '../token/jwt-auth.guard'
import VersionCreateValidationInterceptor from './interceptors/version.create.interceptor'
import VersionDeleteValidationInterceptor from './interceptors/version.delete.interceptor'
import VersionIncreaseValidationInterceptor from './interceptors/version.increase.interceptor'
import VersionUpdateValidationInterceptor from './interceptors/version.update.interceptor'
import { CreateVersionDto, IncreaseVersionDto, UpdateVersionDto, VersionDetailsDto, VersionDto } from './version.dto'
import VersionService from './version.service'

const ProductId = () => Param('productId')
const VersionId = () => Param('versionId')

@Controller('products/:productId/versions')
@ApiTags('products')
@UseGuards(JwtAuthGuard)
@UsePipes(
  new ValidationPipe({
    // TODO(@robot9706): Move to global pipes after removing gRPC
    transform: true,
  }),
)
@UseInterceptors(HttpLoggerInterceptor, PrismaErrorInterceptor, CreatedWithLocationInterceptor)
@UseFilters(HttpExceptionFilter)
export default class VersionHttpController {
  constructor(private service: VersionService) {}

  @Get()
  @ApiOkResponse({ type: VersionDto, isArray: true })
  async getVersions(@ProductId() productId: string, @IdentityFromRequest() identity: Identity): Promise<VersionDto[]> {
    return await this.service.getVersionsByProductId(productId, identity)
  }

  @Get(':versionId')
  @ApiOkResponse({ type: VersionDetailsDto })
  async getVersion(@VersionId() versionId: string): Promise<VersionDetailsDto> {
    return await this.service.getVersionDetails(versionId)
  }

  @Post()
  @CreatedWithLocation()
  @UseInterceptors(VersionCreateValidationInterceptor)
  @ApiBody({ type: CreateVersionDto })
  @ApiCreatedResponse({ type: VersionDto })
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

  @Put(':versionId')
  @HttpCode(204)
  @UseInterceptors(VersionUpdateValidationInterceptor)
  @ApiBody({ type: UpdateVersionDto })
  async updateVersion(
    @VersionId() versionId: string,
    @Body() request: UpdateVersionDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    return await this.service.updateVersion(versionId, request, identity)
  }

  @Delete(':versionId')
  @HttpCode(204)
  @UseInterceptors(VersionDeleteValidationInterceptor)
  @ApiBody({ type: UpdateVersionDto })
  async deleteVersion(@VersionId() versionId: string): Promise<void> {
    return await this.service.deleteVersion(versionId)
  }

  @Put(':versionId/default')
  @HttpCode(204)
  async setDefaultVersion(@ProductId() productId: string, @VersionId() versionId: string): Promise<void> {
    return await this.service.setDefaultVersion(productId, versionId)
  }

  @Post('/:versionId/increase')
  @CreatedWithLocation()
  @UseInterceptors(VersionIncreaseValidationInterceptor)
  @ApiBody({ type: IncreaseVersionDto })
  @ApiCreatedResponse({ type: VersionDto })
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
    return `/products/${productId}/versions/${versionId}`
  }
}
