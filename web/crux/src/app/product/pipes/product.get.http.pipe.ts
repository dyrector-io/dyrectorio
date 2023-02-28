import { PipeTransform } from '@nestjs/common/interfaces'
import { ProductListResponse, productTypeToJSON } from 'src/grpc/protobuf/proto/crux'

export default class ProductGetHTTPPipe implements PipeTransform {
  transform(value: ProductListResponse): any {
    return {
      data: value.data.map(it => ({
        ...it,
        _count: undefined,
        audit: undefined,
        type: productTypeToJSON(it.type).toLocaleLowerCase(),
      })),
    }
  }
}
