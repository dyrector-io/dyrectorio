import { Injectable } from '@nestjs/common'
import AgentService from 'src/app/agent/agent.service'
import PrismaService from 'src/services/prisma.service'
import { UnauthenticatedException } from 'src/exception/errors'
import { ServiceIdRequest } from 'src/grpc/protobuf/proto/crux'
import BodyPipeTransform from 'src/decorators/grpc.pipe'

@Injectable()
export default class NodeGetScriptValidationPipe extends BodyPipeTransform<ServiceIdRequest> {
  constructor(private prisma: PrismaService, private agentService: AgentService) {
    super()
  }

  async transformBody(req: ServiceIdRequest) {
    const node = await this.prisma.node.findUnique({
      select: {
        id: true,
      },
      where: {
        id: req.id,
      },
    })

    if (node) {
      const installer = await this.agentService.getInstallerByNodeId(node.id)
      if (installer) {
        return req
      }
    }

    // throwing intentionally ambigous exceptions, so an attacker can not guess node ids
    throw new UnauthenticatedException({
      message: 'Unauthorized',
    })
  }
}
