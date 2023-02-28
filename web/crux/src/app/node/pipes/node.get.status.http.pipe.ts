import { PipeTransform } from '@nestjs/common/interfaces'
import { timestampToISO } from 'src/domain/utils'
import { ContainerStateListMessage, containerStateToJSON } from 'src/grpc/protobuf/proto/common'

export default class NodeGetContainerStatusHTTPPipe implements PipeTransform {
  transform(value: ContainerStateListMessage): any {
    return {
      prefix: value.prefix,
      data: value.data.map(it => ({
        ...it,
        createdAt: timestampToISO(it.createdAt),
        state: containerStateToJSON(it.state).toLocaleLowerCase(),
      })),
    }
  }
}
