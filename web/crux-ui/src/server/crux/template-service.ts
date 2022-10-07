import { Logger } from '@app/logger'
import {
  AccessRequest,
  CreateEntityResponse,
  CreateProductFromTemplateRequest,
  CruxTemplateClient,
  TemplateListResponse,
} from '@app/models/grpc/protobuf/proto/crux'
import { Template } from '@app/models/template'
import { Identity } from '@ory/kratos-client'
import { protomisify } from '@server/crux/grpc-connection'

class DyoTemplateService {
  private logger = new Logger(DyoTemplateService.name)

  constructor(private client: CruxTemplateClient, private identity: Identity) {}

  async getAll(): Promise<Template[]> {
    const req: AccessRequest = {
      accessedBy: this.identity.id,
    }

    this.logger.error(JSON.stringify(req))

    const res = await protomisify<AccessRequest, TemplateListResponse>(this.client, this.client.getTemplates)(
      AccessRequest,
      req,
    )

    return res.data
  }

  async createProductFromTemplate(id: string, productName: string): Promise<CreateEntityResponse> {
    const req: CreateProductFromTemplateRequest = {
      accessedBy: this.identity.id,
      id,
      productName,
    }

    const res = await protomisify<CreateProductFromTemplateRequest, CreateEntityResponse>(
      this.client,
      this.client.createProductFromTemplate,
    )(CreateProductFromTemplateRequest, req)

    return res
  }
}

export default DyoTemplateService
