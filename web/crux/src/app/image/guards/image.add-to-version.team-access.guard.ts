import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { AddImagesDto } from '../image.dto'

@Injectable()
export default class ImageAddToVersionTeamAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const teamSlug = req.params.teamSlug as string
    const projectId = req.params.projectId as string
    const versionId = req.params.versionId as string
    const body = req.body as AddImagesDto[]

    const regIds = Array.from(new Set(body.map(it => it.registryId)))
    const registries = await this.prisma.registry.count({
      where: {
        id: {
          in: regIds,
        },
        team: {
          slug: teamSlug,
          projects: {
            some: {
              id: projectId,
              versions: {
                some: {
                  id: versionId,
                },
              },
            },
          },
        },
      },
    })

    return registries === regIds.length
  }
}
