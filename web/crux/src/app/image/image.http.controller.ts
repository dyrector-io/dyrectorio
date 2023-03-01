import { Controller, Post, Body, UseGuards, UseInterceptors, Patch, UseFilters } from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import HttpExceptionFilter from 'src/filters/http-exception.filter'
import { Empty } from 'src/grpc/protobuf/proto/common'
import { AddImagesToVersionRequest, ImageListResponse, PatchImageRequest } from 'src/grpc/protobuf/proto/crux'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import { AddImagesToVersionRequestDto, ImageListResponseDto, PatchImageRequestDto } from 'src/swagger/crux.dto'
import { HttpIdentityInterceptor, IdentityFromRequest } from 'src/interceptors/http.identity.interceptor'
import { Identity } from '@ory/kratos-client'
import IdValidationPipe from 'src/pipes/id.validation.pipe'
import HttpResponseTransformInterceptor, {
  TransformResponse,
} from 'src/interceptors/http.response.transform.interceptor'
import JwtAuthGuard from '../token/jwt-auth.guard'
import ImageService from './image.service'
import ImagePatchValidationPipe from './pipes/image.patch.pipe'
import ImageAddToVersionValidationPipe from './pipes/image.add-to-version.pipe'
import ImageAddToVersionHTTPPipe from './pipes/image.add-to-version.http.pipe'

@Controller('image')
@UseGuards(JwtAuthGuard)
@UseInterceptors(
  HttpLoggerInterceptor,
  PrismaErrorInterceptor,
  HttpIdentityInterceptor,
  HttpResponseTransformInterceptor,
)
@UseFilters(HttpExceptionFilter)
export default class ImageHttpController {
  constructor(private service: ImageService) {}

  @Post()
  @ApiBody({ type: AddImagesToVersionRequestDto })
  @ApiCreatedResponse({ type: ImageListResponseDto })
  @AuditLogLevel('disabled')
  @TransformResponse(ImageAddToVersionHTTPPipe)
  async addImagesToVersion(
    @Body(ImageAddToVersionValidationPipe) request: AddImagesToVersionRequest,
    @IdentityFromRequest() identity: Identity,
  ): Promise<ImageListResponse> {
    return this.service.addImagesToVersion(request, identity)
  }

  @Patch()
  @ApiBody({ type: PatchImageRequestDto })
  @ApiOkResponse()
  @AuditLogLevel('disabled')
  async updateImage(
    @Body(IdValidationPipe, ImagePatchValidationPipe) request: PatchImageRequest,
    @IdentityFromRequest() identity: Identity,
  ): Promise<Empty> {
    return await this.service.patchImage(request, identity)
  }
}
