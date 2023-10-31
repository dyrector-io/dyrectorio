import { Module } from '@nestjs/common'
import QualityAssuranceController from './quality-assurance.http.controller'
import PrismaService from 'src/services/prisma.service'
import QualityAssuranceService from './quality-assurance.service'

@Module({
  imports: [],
  exports: [],
  controllers: [QualityAssuranceController],
  providers: [QualityAssuranceService, PrismaService],
})
export default class QualityAssuranceModule {}
