import { Metadata } from '@grpc/grpc-js'
import { Controller } from '@nestjs/common'
import UseGrpcInterceptors from 'src/decorators/grpc-interceptors.decorator'
import {
  CreateEntityResponse,
  CreateProductFromTemplateRequest,
  CruxTemplateController,
  CruxTemplateControllerMethods,
  IdRequest,
  TemplateImageResponse,
  TemplateListResponse,
} from 'src/grpc/protobuf/proto/crux'
import { getIdentity } from 'src/interceptors/grpc.user.interceptor'
import TemplateFileService from 'src/services/template.file.service'
import TemplateService from './template.service'

@Controller()
@CruxTemplateControllerMethods()
@UseGrpcInterceptors()
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
