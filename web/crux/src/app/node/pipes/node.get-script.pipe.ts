import { Injectable, PipeTransform } from '@nestjs/common'
import AgentService from 'src/app/agent/agent.service'
import { CruxUnauthorizedException } from 'src/exception/crux-exception'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class NodeGetScriptValidationPipe implements PipeTransform {
  constructor(private prisma: PrismaService, private agentService: AgentService) {}

  async transform(id: string) {
    const node = await this.prisma.node.findUnique({
      select: {
        id: true,
      },
      where: {
        id,
      },
    })

    if (node) {
      const installer = await this.agentService.getInstallerByNodeId(node.id)
      if (installer) {
        return id
      }
    }

    // throwing intentionally ambigous exceptions, so an attacker can not guess node ids
    throw new CruxUnauthorizedException()
  }
}
