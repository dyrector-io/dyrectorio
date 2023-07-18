import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class ImageTeamAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const teamSlug = req.params.teamSlug as string
    const projectId = req.params.projectId as string
    const versionId = req.params.versionId as string
    const imageId = req.params.imageId as string

    const versions = await this.prisma.version.count({
      where: {
        id: versionId,
        project: {
          id: projectId,
          team: {
            slug: teamSlug,
          },
        },
        images: !imageId
          ? undefined
          : {
              some: {
                id: imageId,
              },
            },
      },
    })

    return versions > 0
  }
}
