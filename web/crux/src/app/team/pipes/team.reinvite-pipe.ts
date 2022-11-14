import { Injectable, PipeTransform } from '@nestjs/common'
import { PreconditionFailedException } from 'src/exception/errors'
import { ReinviteUserRequest } from 'src/grpc/protobuf/proto/crux'
import PrismaService from 'src/services/prisma.service'
import { TEAM_INVITATION_EXPIRATION } from 'src/shared/const'

@Injectable()
export default class TeamReinviteUserValidationPipe implements PipeTransform {
  constructor(private prisma: PrismaService) {}

  async transform(value: ReinviteUserRequest) {
    const invite = await this.prisma.userInvitation.findUniqueOrThrow({
      where: {
        userId_teamId: {
          userId: value.userId,
          teamId: value.id,
        },
      },
    })

    const now = new Date().getTime()
    if (invite.status !== 'expired' && now < invite.createdAt.getTime() + TEAM_INVITATION_EXPIRATION) {
      throw new PreconditionFailedException({
        message: 'Invitation link is not expired.',
        property: 'userId',
        value: value.userId,
      })
    }

    return value
  }
}
