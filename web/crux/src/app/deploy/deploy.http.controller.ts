import { Controller, Post, Body } from '@nestjs/common'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import { Empty } from 'src/grpc/protobuf/proto/common'
import { CreateDeploymentRequest, CreateEntityResponse, IdRequest } from 'src/grpc/protobuf/proto/crux'
import DeployService from './deploy.service'
import DeployStartValidationPipe from './pipes/deploy.start.pipe'

@Controller('deploy')
export default class DeployHttpController {
  constructor(private service: DeployService) {}

  @Post()
  @AuditLogLevel('disabled')
  async createDeployment(@Body() request: CreateDeploymentRequest): Promise<CreateEntityResponse> {
    return this.service.createDeployment(request)
  }

  @Post('start')
  @AuditLogLevel('disabled')
  async startDeployment(@Body(DeployStartValidationPipe) request: IdRequest): Promise<Empty> {
    return await this.service.startDeployment(request)
  }
}
