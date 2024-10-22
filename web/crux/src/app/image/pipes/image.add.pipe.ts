import { Injectable, PipeTransform } from '@nestjs/common'
import { CruxBadRequestException } from 'src/exception/crux-exception'

@Injectable()
export default class ValidateNonEmptyArrayPipe implements PipeTransform {
  transform(body: any) {
    if (!Array.isArray(body) || body.length === 0) {
      throw new CruxBadRequestException({ message: 'Request body must be a non-empty array.', property: body })
    }
    return body
  }
}
