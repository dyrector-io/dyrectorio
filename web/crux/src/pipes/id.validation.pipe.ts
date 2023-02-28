import { Injectable, PipeTransform } from '@nestjs/common'
import { NotFoundException } from 'src/exception/errors'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'

@Injectable()
export default class IdValidationPipe implements PipeTransform {
  async transform(value: IdRequest) {
    if (!value.id) {
      throw new NotFoundException({
        property: 'id',
        message: 'Id field is required',
      })
    }
    return value
  }
}
