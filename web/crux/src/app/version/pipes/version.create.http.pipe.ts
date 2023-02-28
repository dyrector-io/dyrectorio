import { PipeTransform } from '@nestjs/common/interfaces'
import { versionTypeFromJSON } from 'src/grpc/protobuf/proto/crux'
import { CreateVersionRequestDto } from 'src/swagger/crux.dto'

export default class VersionCreateHTTPPipe implements PipeTransform {
  transform(value: CreateVersionRequestDto): CreateVersionRequestDto {
    return {
      ...value,
      type: versionTypeFromJSON(value.type.toString().toUpperCase()),
    }
  }
}
