import { Injectable, PipeTransform } from '@nestjs/common'
import { AgentService } from 'src/app/agent/agent.service'
import { PrismaService } from 'src/services/prisma.service'
import { AlreadyExistsException } from 'src/exception/errors'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'

@Injectable()
export class NodeGenerateScriptValidationPipe implements PipeTransform {
  constructor(private prisma: PrismaService, private agentService: AgentService) {}

  async transform(req: IdRequest) {
    const node = await this.prisma.node.findUniqueOrThrow({
      select: {
        id: true,
      },
      where: {
        id: req.id,
      },
    })

    const agent = this.agentService.getById(node.id)
    if (agent) {
      throw new AlreadyExistsException({
        message: 'Node is already connected',
        property: 'id',
        value: node.id,
      })
    }

    return req
  }
}
