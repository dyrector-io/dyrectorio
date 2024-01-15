import { Injectable } from '@nestjs/common'
import { CanActivate, ExecutionContext } from '@nestjs/common/interfaces'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class PipelineTeamAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const teamSlug = req.params.teamSlug as string
    const pipelineId = req.params.pipelineId as string

    if (!pipelineId) {
      return true
    }

    const pipelines = await this.prisma.pipeline.count({
      where: {
        id: pipelineId,
        team: {
          slug: teamSlug,
        },
      },
    })

    return pipelines > 0
  }
}
