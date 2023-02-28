import { PipeTransform } from '@nestjs/common/interfaces'
import { VersionListResponse, versionTypeToJSON } from 'src/grpc/protobuf/proto/crux'

export default class VersionGetHTTPPipe implements PipeTransform {
  transform(value: VersionListResponse): any {
    return {
      data: value.data.map(it => ({
        ...it,
        audit: undefined,
        type: versionTypeToJSON(it.type).toLocaleLowerCase(),
      })),
    }
  }
}
