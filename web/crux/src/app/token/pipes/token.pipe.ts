import { Injectable, PipeTransform } from '@nestjs/common'
import { InvalidArgumentException, NotFoundException } from 'src/exception/errors'
import { GenerateTokenRequest } from 'src/grpc/protobuf/proto/crux'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class TokenValidationPipe implements PipeTransform {
  constructor(private prisma: PrismaService, private kratosService: KratosService) {}

  async transform(value: GenerateTokenRequest) {
    const user = await this.kratosService.getIdentityById(value.accessedBy)

    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
        property: 'accessedBy',
        value: value.accessedBy,
      })
    }

    if (value.expirationInDays <= 0) {
      throw new InvalidArgumentException({
        property: 'expirationInDays',
        value: value.expirationInDays,
        message: `Expiration cannot be zero or negative`,
      })
    }

    return value
  }
}
