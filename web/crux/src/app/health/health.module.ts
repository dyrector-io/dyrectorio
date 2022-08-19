import { Module } from '@nestjs/common'
import { InterceptorGrpcHelperProvider } from 'src/interceptors/helper.interceptor'
import { PrismaService } from 'src/services/prisma.service'
import { HealthController } from './health.controller'
import { HealthService } from './health.service'

@Module({
  imports: [],
  exports: [],
  controllers: [HealthController],
  providers: [PrismaService, InterceptorGrpcHelperProvider, HealthService],
})
export class HealthModule {}
