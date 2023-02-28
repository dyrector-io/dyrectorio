import { Logger } from '@app/logger'
import { Empty } from '@app/models/grpc/protobuf/proto/common'
import {
  CreateEntityResponse,
  CreateProductFromTemplateRequest,
  CruxTemplateClient,
  IdRequest,
  TemplateImageResponse,
  TemplateListResponse,
} from '@app/models/grpc/protobuf/proto/crux'
import { ApplyTemplate, Template } from '@app/models/template'
import { protomisify } from '@server/crux/grpc-connection'
import { typeToProto } from './mappers/product-mappers'

class DyoTemplateService {
  private logger = new Logger(DyoTemplateService.name)

  constructor(private client: CruxTemplateClient, private cookie: string) {}

  async getAll(): Promise<Template[]> {
    const res = await protomisify<Empty, TemplateListResponse>(
      this.client,
      this.client.getTemplates,
      this.cookie,
    )(Empty, {})

    return res.data
  }

  async createProductFromTemplate(request: ApplyTemplate): Promise<CreateEntityResponse> {
    const { id, name, description, type } = request

    const req: CreateProductFromTemplateRequest = {
      id,
      name,
      description,
      type: typeToProto(type),
    }

    const res = await protomisify<CreateProductFromTemplateRequest, CreateEntityResponse>(
      this.client,
      this.client.createProductFromTemplate,
      this.cookie,
    )(CreateProductFromTemplateRequest, req)

    return res
  }

  async getImage(id: string): Promise<TemplateImageResponse> {
    const req: IdRequest = {
      id,
    }

    const res = await protomisify<IdRequest, TemplateImageResponse>(
      this.client,
      this.client.getImage,
      this.cookie,
    )(IdRequest, req)

    return res
  }
}

export default DyoTemplateService
