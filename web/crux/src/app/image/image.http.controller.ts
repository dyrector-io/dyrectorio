import { Controller, Post, Body } from '@nestjs/common'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import { AddImagesToVersionRequest, ImageListResponse } from 'src/grpc/protobuf/proto/crux'
import ImageService from './image.service'

@Controller('image')
export default class ImageHttpController {
  constructor(private service: ImageService) {}

  @Post()
  @AuditLogLevel('disabled')
  async addImagesToVersion(@Body() request: AddImagesToVersionRequest): Promise<ImageListResponse> {
    return this.service.addImagesToVersion(request)
  }
}
