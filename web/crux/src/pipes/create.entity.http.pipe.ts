import { PipeTransform } from '@nestjs/common/interfaces'
import { timestampToISO } from 'src/domain/utils'
import { CreateEntityResponse } from 'src/grpc/protobuf/proto/crux'

export default class CreateEntityResponseHTTPPipe implements PipeTransform {
  transform(value: CreateEntityResponse) {
    return {
      ...value,
      createdAt: timestampToISO(value.createdAt),
    }
  }
}
