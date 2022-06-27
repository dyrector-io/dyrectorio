import { Controller, UseInterceptors } from '@nestjs/common'
import { GrpcContextLogger } from 'src/interceptors/grpc-context-logger.interceptor'
import { CruxHealthController, CruxHealthControllerMethods, Empty } from 'src/proto/proto/crux'

@Controller()
@CruxHealthControllerMethods()
@UseInterceptors(GrpcContextLogger)
export class HealthController implements CruxHealthController {
  getHealth(): Empty {
    return Empty
  }
}
