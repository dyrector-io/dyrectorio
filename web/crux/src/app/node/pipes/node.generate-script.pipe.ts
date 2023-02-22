import { Injectable } from '@nestjs/common'
import AgentService from 'src/app/agent/agent.service'
import PrismaService from 'src/services/prisma.service'
import { AlreadyExistsException } from 'src/exception/errors'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'
import BodyPipeTransform from 'src/decorators/grpc.pipe'

@Injectable()
export default class NodeGenerateScriptValidationPipe extends BodyPipeTransform<IdRequest> {
  constructor(private prisma: PrismaService, private agentService: AgentService) {
    super()
  }

  async transformBody(req: IdRequest) {
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
