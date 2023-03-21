import { Metadata } from '@grpc/grpc-js'
import { Controller, UseGuards } from '@nestjs/common'
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
import TemplateFileService from 'src/services/template.file.service'
import UserAccessGuard, { IdentityAwareServerSurfaceCall } from 'src/shared/user-access.guard'
import TemplateService from './template.service'

@Controller()
@CruxTemplateControllerMethods()
@UseGrpcInterceptors()
@UseGuards(UserAccessGuard)
export default class TemplateController implements CruxTemplateController {
  constructor(private service: TemplateService, private templateFileService: TemplateFileService) {}

  async getTemplates(): Promise<TemplateListResponse> {
    return {
      data: await this.templateFileService.getTemplates(),
    }
  }

  async createProductFromTemplate(
    request: CreateProductFromTemplateRequest,
    _: Metadata,
    call: IdentityAwareServerSurfaceCall,
  ): Promise<CreateEntityResponse> {
    const product = await this.service.createProductFromTemplate(request, call.user)

    return CreateEntityResponse.fromJSON(product)
  }

  getImage(request: IdRequest): Promise<TemplateImageResponse> {
    return this.service.getImage(request.id)
  }
}
