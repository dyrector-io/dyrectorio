import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import QualityAssuranceController from './quality-assurance.http.controller'
import QualityAssuranceService from './quality-assurance.service'

@Module({
  imports: [],
  exports: [],
  controllers: [QualityAssuranceController],
  providers: [QualityAssuranceService, PrismaService],
})
export default class QualityAssuranceModule {}
