import { Controller, Body, Get, UseGuards, UseInterceptors } from '@nestjs/common'
import { ApiBody, ApiOkResponse } from '@nestjs/swagger'
import { first, Observable, timeout } from 'rxjs'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import { ContainerStateListMessage } from 'src/grpc/protobuf/proto/common'
import { WatchContainerStateRequest } from 'src/grpc/protobuf/proto/crux'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import { ContainerStateListMessageDto, WatchContainerStateRequestDto } from 'src/swagger/crux.dto'
import JwtAuthGuard from '../token/jwt-auth.guard'
import NodeService from './node.service'

@Controller('node')
@UseGuards(JwtAuthGuard)
@UseInterceptors(HttpLoggerInterceptor)
@AuditLogLevel('disabled')
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
   * this is just an experimental implementation, and should be improved in the future.
   */
  @Get('status')
  @ApiBody({ type: WatchContainerStateRequestDto })
  @ApiOkResponse({ type: ContainerStateListMessageDto })
  @AuditLogLevel('disabled')
  async getContainerStatus(@Body() params: WatchContainerStateRequest): Promise<Observable<ContainerStateListMessage>> {
    return this.service
      .handleWatchContainerStatus(params)
      .pipe(first(value => value.data?.length > 0))
      .pipe(timeout(1000))
  }
}
