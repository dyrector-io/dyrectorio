import { Injectable } from '@nestjs/common'
import BodyPipeTransform from 'src/decorators/grpc.pipe'
import { InvalidArgumentException } from 'src/exception/errors'
import { GenerateTokenRequest } from 'src/grpc/protobuf/proto/crux'

@Injectable()
export default class TokenValidationPipe extends BodyPipeTransform<GenerateTokenRequest> {
  async transformBody(req: GenerateTokenRequest): Promise<GenerateTokenRequest> {
    if (req.expirationInDays <= 0) {
      throw new InvalidArgumentException({
        property: 'expirationInDays',
        value: req.expirationInDays,
        message: `Expiration cannot be zero or negative`,
      })
    }

    return req
  }
}
