import { Injectable, PipeTransform } from '@nestjs/common'
import { AgentService } from 'src/app/agent/agent.service'
import { PrismaService } from 'src/config/prisma.service'
import { UnauthenticatedException } from 'src/exception/errors'
import { ServiceIdRequest } from 'src/proto/proto/crux'

@Injectable()
export class NodeGetScriptValidationPipe implements PipeTransform {
  constructor(private prisma: PrismaService, private agentService: AgentService) {}

  async transform(req: ServiceIdRequest) {
    const node = await this.prisma.node.findUnique({
      rejectOnNotFound: false,
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
