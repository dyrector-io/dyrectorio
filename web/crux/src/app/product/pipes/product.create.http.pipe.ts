import { PipeTransform } from '@nestjs/common/interfaces'
import { CreateProductRequest, productTypeFromJSON } from 'src/grpc/protobuf/proto/crux'
import { CreateProductRequestDto } from 'src/swagger/crux.dto'

export default class ProductCreateHTTPPipe implements PipeTransform {
  transform(value: CreateProductRequestDto): CreateProductRequest {
    return {
      ...value,
      type: productTypeFromJSON(value.type.toString().toUpperCase()),
    }
  }
}
