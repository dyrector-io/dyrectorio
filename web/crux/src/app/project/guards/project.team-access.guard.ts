import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { identityOfRequest } from 'src/app/token/jwt-auth.guard'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class ProjectTeamAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const teamSlug = req.params.teamSlug as string
    const projectId = req.params.projectId as string

    if (!projectId) {
      return true
    }

    const projects = await this.prisma.project.count({
      where: {
        id: projectId,
        team: {
          slug: teamSlug,
        },
      },
    })

    return projects > 0
  }
}
