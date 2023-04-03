import { Module } from '@nestjs/common'
import InterceptorGrpcHelperProvider from 'src/interceptors/helper.interceptor'
import PrismaService from 'src/services/prisma.service'
import HealthHttpController from './health.http.controller'
import HealthService from './health.service'

@Module({
  imports: [],
  exports: [],
  controllers: [HealthHttpController],
  providers: [PrismaService, InterceptorGrpcHelperProvider, HealthService],
})
export default class HealthModule {}
