import { Controller, UseGuards } from '@nestjs/common'
import UseGrpcInterceptors from 'src/decorators/grpc-interceptors.decorator'
import {
  CreateEntityResponse,
  CruxTemplateController,
  CruxTemplateControllerMethods,
  IdRequest,
  TemplateImageResponse,
  TemplateListResponse,
} from 'src/grpc/protobuf/proto/crux'
import TemplateFileService from 'src/services/template.file.service'
import UserAccessGuard from 'src/shared/user-access.guard'
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

  createProductFromTemplate(): Promise<CreateEntityResponse> {
    return null
    // return this.service.createProductFromTemplate(request, call.user)
  }

  getImage(request: IdRequest): Promise<TemplateImageResponse> {
    return this.service.getImage(request.id)
  }
}
