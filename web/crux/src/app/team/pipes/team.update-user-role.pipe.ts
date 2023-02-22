import { Injectable } from '@nestjs/common'
import BodyPipeTransform from 'src/decorators/grpc.pipe'
import { PermissionDeniedException } from 'src/exception/errors'
import { UpdateUserRoleInTeamRequest } from 'src/grpc/protobuf/proto/crux'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class TeamUpdateUserRoleValidationPipe extends BodyPipeTransform<UpdateUserRoleInTeamRequest> {
  constructor(private prisma: PrismaService) {
    super()
  }

  async transformBody(value: UpdateUserRoleInTeamRequest) {
    const userOnTeam = await this.prisma.usersOnTeams.findUnique({
      where: {
        userId_teamId: {
          teamId: value.id,
          userId: value.userId,
        },
      },
    })

    if (userOnTeam.role === 'owner') {
      throw new PermissionDeniedException({
        message: 'Can not change the role of the team owner',
      })
    }

    return value
  }
}
