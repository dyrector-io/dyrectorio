import { Controller, Get, Body } from '@nestjs/common'
import { Observable } from 'rxjs'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import { ContainerStateListMessage } from 'src/grpc/protobuf/proto/common'
import { WatchContainerStateRequest } from 'src/grpc/protobuf/proto/crux'
import NodeService from './node.service'

@Controller('node')
export default class NodeHttpController {
  constructor(private service: NodeService) {}

  @Get('status')
  @AuditLogLevel('disabled')
  async getContainerStatus(
    @Body() request: WatchContainerStateRequest,
  ): Promise<Observable<ContainerStateListMessage>> {
    console.log(JSON.stringify(request))
    return this.service.handleWatchContainerStatus(request)
  }
}
