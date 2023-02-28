import { PipeTransform } from '@nestjs/common/interfaces'
import { RegistryListResponse, registryTypeToJSON } from 'src/grpc/protobuf/proto/crux'

export default class RegistryGetHTTPPipe implements PipeTransform {
  transform(value: RegistryListResponse): any {
    return {
      data: value.data.map(it => ({
        ...it,
        audit: undefined,
        type: registryTypeToJSON(it.type).toLocaleLowerCase(),
      })),
    }
  }
}
