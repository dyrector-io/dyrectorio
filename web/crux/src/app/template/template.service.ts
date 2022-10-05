import { Injectable } from '@nestjs/common'
import { toTimestamp } from 'src/domain/utils'
import {
  CreateEntityResponse,
  CreateProductFromTemplateRequest,
  TemplateListResponse,
} from 'src/grpc/protobuf/proto/crux'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class TemplateService {
  constructor(
    private prisma: PrismaService,
  ) {}
  
  async createProductFromTemplate(req: CreateProductFromTemplateRequest): Promise<CreateEntityResponse> {
    return {
      id: "asd",
      createdAt: toTimestamp(new Date())
    }
  }
}
