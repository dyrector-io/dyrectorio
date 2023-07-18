import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class ImageOrderImagesTeamAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const teamSlug = req.params.teamSlug as string
    const projectId = req.params.projectId as string
    const versionId = req.params.versionId as string
    const body = req.body as string[]

    // check the sent imageIds and versionId against the user's team
    const images = await this.prisma.image.count({
      where: {
        id: {
          in: body,
        },
        version: {
          id: versionId,
          project: {
            id: projectId,
            team: {
              slug: teamSlug,
            },
          },
        },
      },
    })

    // when the selected images count doesn't match the number of images according to the request, then
    // the user missing access for some, or teams are mixed up
    return images === body.length
  }
}
