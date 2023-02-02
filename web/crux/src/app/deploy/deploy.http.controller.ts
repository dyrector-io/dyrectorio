import { Controller, Post, Body, UseGuards, UseInterceptors, Version } from '@nestjs/common'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import { Empty } from 'src/grpc/protobuf/proto/common'
import { CreateDeploymentRequest, CreateEntityResponse, IdRequest } from 'src/grpc/protobuf/proto/crux'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import JwtAuthGuard from '../token/jwt-auth.guard'
import DeployService from './deploy.service'
import DeployStartValidationPipe from './pipes/deploy.start.pipe'

@Controller('deploy')
export default class DeployHttpController {
  constructor(private service: DeployService) {}

  @Post()
  @Version('1')
  @AuditLogLevel('disabled')
  async createDeployment(@Body() request: CreateDeploymentRequest): Promise<CreateEntityResponse> {
    return this.service.createDeployment(request)
  }

  @Post('start')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(HttpLoggerInterceptor)
  @AuditLogLevel('disabled')
  async startDeployment(@Body(DeployStartValidationPipe) request: IdRequest): Promise<Empty> {
    return await this.service.startDeployment(request)
  }
}
