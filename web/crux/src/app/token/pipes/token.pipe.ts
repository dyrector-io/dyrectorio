import { Injectable, PipeTransform } from '@nestjs/common'
import { CruxBadRequestException } from 'src/exception/crux-exception'
import { GenerateTokenDto } from '../token.dto'

@Injectable()
export default class TokenValidationPipe implements PipeTransform {
  async transform(req: GenerateTokenDto) {
    if (req.expirationInDays <= 0) {
      throw new CruxBadRequestException({
        property: 'expirationInDays',
        value: req.expirationInDays,
        message: `Expiration cannot be zero or negative`,
      })
    }

    return req
  }
}
