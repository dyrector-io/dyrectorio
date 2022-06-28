import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/config/prisma.service'
import { CreateDeploymentRequest } from 'src/grpc/protobuf/proto/crux'

@Injectable()
export class DeployCreateTeamAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.getArgByIndex<CreateDeploymentRequest>(0)

    const version = await this.prisma.version.count({
      where: {
        id: request.versionId,
        product: {
          team: {
            users: {
              some: {
                userId: request.accessedBy,
                active: true,
              },
            },
            nodes: {
              some: {
                id: request.nodeId,
              },
            },
          },
        },
      },
    })

    return version > 0
  }
}
