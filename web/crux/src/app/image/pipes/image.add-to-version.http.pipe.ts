import { PipeTransform } from '@nestjs/common/interfaces'
import { timestampToISO } from 'src/domain/utils'
import { ImageListResponse } from 'src/grpc/protobuf/proto/crux'

export default class ImageAddToVersionHTTPPipe implements PipeTransform {
  transform(value: ImageListResponse) {
    return {
      data: value.data.map(it => ({
        ...it,
        createdAt: timestampToISO(it.createdAt),
      })),
    }
  }
}
