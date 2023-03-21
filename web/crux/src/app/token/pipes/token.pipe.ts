import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import { GenerateTokenDto } from '../token.dto'

@Injectable()
export default class TokenValidationPipe implements PipeTransform {
  async transform(req: GenerateTokenDto) {
    if (req.expirationInDays <= 0) {
      throw new BadRequestException({
        property: 'expirationInDays',
        value: req.expirationInDays,
        message: `Expiration cannot be zero or negative`,
      })
    }

    return req
  }
}
