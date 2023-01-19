import { Controller, Get, Query } from '@nestjs/common'
import { concatAll, defaultIfEmpty, filter, first, Observable, timeout } from 'rxjs'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import { ContainerStateListMessage } from 'src/grpc/protobuf/proto/common'
import { WatchContainerStateRequest } from 'src/grpc/protobuf/proto/crux'
import NodeService from './node.service'

@Controller('node')
export default class NodeHttpController {
  constructor(private service: NodeService) {}

  /**
   * @param request WatchContainerStateRequest
   * @returns Promise<Observable<ContainerStateListMessage>>
   * @description HTTP Endpoint to get the status of all containers in a node.
   *
   * Client can subscribe to the returned observable, and receive new data as it becomes available.
   *
   * @todo(polaroi8d): if timeout will occured, the client will not receive any data.
   */
  @Get('status')
  @AuditLogLevel('disabled')
  async getContainerStatus(
    @Query() params: WatchContainerStateRequest,
  ): Promise<Observable<ContainerStateListMessage>> {
    return this.service
      .handleWatchContainerStatus(params)
      .pipe(first(value => value.data?.length > 0))
      .pipe(timeout(1000))
  }
}
