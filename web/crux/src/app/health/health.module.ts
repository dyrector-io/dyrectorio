import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import HealthHttpController from './health.http.controller'
import HealthService from './health.service'

@Module({
  imports: [],
  exports: [],
  controllers: [HealthHttpController],
  providers: [PrismaService, HealthService],
})
export default class HealthModule {}
