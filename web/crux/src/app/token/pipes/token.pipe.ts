import { Injectable, PipeTransform } from '@nestjs/common'
import { InvalidArgumentException } from 'src/exception/errors'
import { GenerateToken } from '../token.dto'

@Injectable()
export default class TokenValidationPipe implements PipeTransform {
  async transform(req: GenerateToken) {
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
