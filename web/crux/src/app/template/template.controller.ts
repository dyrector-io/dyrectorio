import { Metadata } from '@grpc/grpc-js'
import { Controller, UseInterceptors } from '@nestjs/common'
import {
  CreateEntityResponse,
  TemplateListResponse,
  CreateProductFromTemplateRequest,
  CruxTemplateController,
  CruxTemplateControllerMethods,
  TemplateImageResponse,
  IdRequest,
} from 'src/grpc/protobuf/proto/crux'
import GrpcErrorInterceptor from 'src/interceptors/grpc.error.interceptor'
import GrpcLoggerInterceptor from 'src/interceptors/grpc.logger.interceptor'
import GrpcUserInterceptor, { getIdentity } from 'src/interceptors/grpc.user.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import TemplateFileService from 'src/services/template.file.service'
import TemplateService from './template.service'

@Controller()
@CruxTemplateControllerMethods()
@UseInterceptors(GrpcLoggerInterceptor, GrpcUserInterceptor, GrpcErrorInterceptor, PrismaErrorInterceptor)
export default class TemplateController implements CruxTemplateController {
  constructor(private service: TemplateService, private templateFileService: TemplateFileService) {}

  async getTemplates(): Promise<TemplateListResponse> {
    return {
      data: await this.templateFileService.getTemplates(),
    }
  }

  createProductFromTemplate(
    request: CreateProductFromTemplateRequest,
    metadata: Metadata,
  ): Promise<CreateEntityResponse> {
    return this.service.createProductFromTemplate(request, getIdentity(metadata))
  }

  getImage(request: IdRequest): Promise<TemplateImageResponse> {
    return this.service.getImage(request.id)
  }
}
