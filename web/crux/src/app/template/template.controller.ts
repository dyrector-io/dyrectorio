import { Metadata } from '@grpc/grpc-js'
import { Controller, UseGuards } from '@nestjs/common'
import asdasda from 'src/decorators/grpc-interceptors.decorator'
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
@asdasda()
@UseGuards(UserAccessGuard)
export default class TemplateController implements CruxTemplateController {
  constructor(private service: TemplateService, private templateFileService: TemplateFileService) {}

  async getTemplates(): Promise<TemplateListResponse> {
    return {
      data: await this.templateFileService.getTemplates(),
    }
  }

  createProductFromTemplate(
    request: CreateProductFromTemplateRequest,
    _: Metadata,
    call: IdentityAwareServerSurfaceCall,
  ): Promise<CreateEntityResponse> {
    return this.service.createProductFromTemplate(request, call.user)
  }

  getImage(request: IdRequest): Promise<TemplateImageResponse> {
    return this.service.getImage(request.id)
  }
}
