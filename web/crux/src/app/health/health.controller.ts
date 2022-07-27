import { Controller } from '@nestjs/common'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import { CruxHealthController, CruxHealthControllerMethods, Empty } from 'src/grpc/protobuf/proto/crux'

@Controller()
@CruxHealthControllerMethods()
export class HealthController implements CruxHealthController {
  @AuditLogLevel('disabled')
  getHealth(): Empty {
    return Empty
  }
}
