import { Controller, UseInterceptors } from '@nestjs/common'
import {
  CreateEntityResponse,
  TemplateListResponse,
  CreateProductFromTemplateRequest,
  CruxTemplateController,
  CruxTemplateControllerMethods,
} from 'src/grpc/protobuf/proto/crux'
import GrpcErrorInterceptor from 'src/interceptors/grpc.error.interceptor'
import GrpcLoggerInterceptor from 'src/interceptors/grpc.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import TemplateFileService from 'src/services/template.file.service'
import TemplateService from './template.service'

@Controller()
@CruxTemplateControllerMethods()
@UseInterceptors(GrpcLoggerInterceptor, GrpcErrorInterceptor, PrismaErrorInterceptor)
export default class TemplateController implements CruxTemplateController {
  constructor(private service: TemplateService, private templateFileService: TemplateFileService) {}

  async getTemplates(): Promise<TemplateListResponse> {
    return {
      data: await this.templateFileService.getTemplates(),
    }
  }

  createProductFromTemplate(request: CreateProductFromTemplateRequest): Promise<CreateEntityResponse> {
    return this.service.createProductFromTemplate(request)
  }
}
