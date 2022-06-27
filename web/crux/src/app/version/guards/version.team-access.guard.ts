import { Injectable } from '@nestjs/common'
import { IdRequest } from 'src/proto/proto/crux'
import { TeamAccessGuard } from 'src/shared/team-access.guard'

@Injectable()
export class VersionTeamAccessGuard extends TeamAccessGuard {
  async canActivateWithIdRequest(request: IdRequest): Promise<boolean> {
    const versions = await this.prisma.version.count({
      where: {
        id: request.id,
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
    })

    return versions > 0
  }
}
