import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/config/prisma.service'
import { IdRequest } from 'src/proto/proto/crux'

@Injectable()
export class DeployGetByVersionTeamAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.getArgByIndex<IdRequest>(0)

    const version = await this.prisma.version.count({
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

    return version > 0
  }
}
