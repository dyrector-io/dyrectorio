import { Body, Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common'
import { first, Observable, timeout } from 'rxjs'
import { ContainerStateListMessage } from 'src/grpc/protobuf/proto/common'
import { WatchContainerStateRequest } from 'src/grpc/protobuf/proto/crux'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import JwtAuthGuard from '../token/jwt-auth.guard'
import NodeService from './node.service'

@Controller('node')
@UseGuards(JwtAuthGuard)
@UseInterceptors(HttpLoggerInterceptor, PrismaErrorInterceptor)
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
   * This is just an experimental implementation, and should be improved in the future.
   */
  @Get('status')
  // @ApiBody({ type: WatchContainerStateRequestDto })
  // @ApiOkResponse({ type: ContainerStateListMessageDto })
  async getContainerStatus(@Body() params: WatchContainerStateRequest): Promise<Observable<ContainerStateListMessage>> {
    return this.service
      .handleWatchContainerStatus(params)
      .pipe(first(value => value.data?.length > 0))
      .pipe(timeout(1000))
  }
}
