import { Controller } from '@nestjs/common'
import {
  CreateEntityResponse,
  TemplateListResponse,
  CreateProductFromTemplateRequest,
  CruxTemplateController,
  CruxTemplateControllerMethods,
} from 'src/grpc/protobuf/proto/crux'
import TemplateFileService from 'src/services/template.file.service'
import TemplateService from './template.service'

@Controller()
@CruxTemplateControllerMethods()
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
