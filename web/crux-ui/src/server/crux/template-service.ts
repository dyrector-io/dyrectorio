import { Logger } from '@app/logger'
import {
  AccessRequest,
  CreateEntityResponse,
  CreateProductFromTemplateRequest,
  CruxTemplateClient,
  TemplateListResponse,
} from '@app/models/grpc/protobuf/proto/crux'
import { ApplyTemplate, Template } from '@app/models/template'
import { Identity } from '@ory/kratos-client'
import { protomisify } from '@server/crux/grpc-connection'
import { typeToProto } from './mappers/product-mappers'

class DyoTemplateService {
  private logger = new Logger(DyoTemplateService.name)

  constructor(private client: CruxTemplateClient, private identity: Identity) {}

  async getAll(): Promise<Template[]> {
    const req: AccessRequest = {
      accessedBy: this.identity.id,
    }

    const res = await protomisify<AccessRequest, TemplateListResponse>(this.client, this.client.getTemplates)(
      AccessRequest,
      req,
    )

    return res.data
  }

  async createProductFromTemplate(request: ApplyTemplate): Promise<CreateEntityResponse> {
    const { id, name, description, type } = request

    const req: CreateProductFromTemplateRequest = {
      accessedBy: this.identity.id,
      id,
      name,
      description,
      type: typeToProto(type),
    }

    const res = await protomisify<CreateProductFromTemplateRequest, CreateEntityResponse>(
      this.client,
      this.client.createProductFromTemplate,
    )(CreateProductFromTemplateRequest, req)

    return res
  }
}

export default DyoTemplateService
