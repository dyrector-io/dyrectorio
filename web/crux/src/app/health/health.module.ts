import { Module } from '@nestjs/common'
import { InterceptorGrpcHelperProvider } from 'src/interceptors/helper.interceptor'
import { HealthController } from './health.controller'

@Module({
  imports: [],
  exports: [],
  controllers: [HealthController],
  providers: [InterceptorGrpcHelperProvider],
})
export class HealthModule {}
