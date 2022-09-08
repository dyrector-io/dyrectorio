import { Controller } from '@nestjs/common'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import { CruxHealthController, CruxHealthControllerMethods, HealthResponse } from 'src/grpc/protobuf/proto/crux'
import HealthService from './health.service'

@Controller()
@CruxHealthControllerMethods()
export default class HealthController implements CruxHealthController {
  constructor(private readonly service: HealthService) {}

  @AuditLogLevel('disabled')
  async getHealth(): Promise<HealthResponse> {
    return this.service.getHealth()
  }
}
