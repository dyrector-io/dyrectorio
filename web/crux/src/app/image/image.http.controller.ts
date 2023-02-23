import { Controller, Post, Body, UseGuards, UseInterceptors, Patch, UseFilters } from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import HttpExceptionFilter from 'src/filters/http-exception.filter'
import { Empty } from 'src/grpc/protobuf/proto/common'
import { AddImagesToVersionRequest, ImageListResponse, PatchImageRequest } from 'src/grpc/protobuf/proto/crux'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import { AddImagesToVersionRequestDto, ImageListResponseDto, PatchImageRequestDto } from 'src/swagger/crux.dto'
import JwtAuthGuard from '../token/jwt-auth.guard'
import ImageService from './image.service'
import ImagePatchValidationPipe from './pipes/image.patch.pipe'

@Controller('image')
@UseGuards(JwtAuthGuard)
@UseInterceptors(HttpLoggerInterceptor, PrismaErrorInterceptor)
@UseFilters(HttpExceptionFilter)
export default class ImageHttpController {
  constructor(private service: ImageService) {}

  @Post()
  @ApiBody({ type: AddImagesToVersionRequestDto })
  @ApiCreatedResponse({ type: ImageListResponseDto })
  @AuditLogLevel('disabled')
  async addImagesToVersion(@Body() request: AddImagesToVersionRequest): Promise<ImageListResponse> {
    return this.service.addImagesToVersion(request)
  }

  @Patch()
  @ApiBody({ type: PatchImageRequestDto })
  @ApiOkResponse()
  @AuditLogLevel('disabled')
  async UpdateImage(@Body(ImagePatchValidationPipe) request: PatchImageRequest): Promise<Empty> {
    return await this.service.patchImage(request)
  }
}
