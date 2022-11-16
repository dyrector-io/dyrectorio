import { Injectable, PipeTransform } from '@nestjs/common'
import { PreconditionFailedException } from 'src/exception/errors'
import { ReinviteUserRequest } from 'src/grpc/protobuf/proto/crux'
import PrismaService from 'src/services/prisma.service'

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

    if (invite.status === 'declined') {
      throw new PreconditionFailedException({
        message: 'Can not resend the invitation e-mail. The invitation was declined.',
        property: 'userId',
        value: value.userId,
      })
    }

    return value
  }
}
