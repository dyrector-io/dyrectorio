import { Injectable } from '@nestjs/common'
import { IdRequest } from 'src/proto/proto/crux'
import { TeamAccessGuard } from 'src/shared/team-access.guard'

@Injectable()
export class ImageTeamAccessGuard extends TeamAccessGuard {
  async canActivateWithIdRequest(request: IdRequest): Promise<boolean> {
    const images = await this.prisma.image.count({
      where: {
        id: request.id,
        version: {
          product: {
            team: {
              users: {
                some: {
                  userId: request.accessedBy,
                  active: true,
                },
              },
            },
          },
        },
      },
    })

    return images > 0
  }
}
