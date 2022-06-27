import { Module } from '@nestjs/common'
import { PrismaService } from 'src/config/prisma.service'
import { InterceptorGrpcHelperProvider } from 'src/interceptors/helper.interceptor'
import { DeployModule } from '../deploy/deploy.module'
import { ImageModule } from '../image/image.module'
import { TeamRepository } from '../team/team.repository'
import { VersionController } from './version.controller'
import { VersionMapper } from './version.mapper'
import { VersionService } from './version.service'

@Module({
  imports: [DeployModule, ImageModule],
  exports: [VersionService, VersionMapper],
  controllers: [VersionController],
  providers: [VersionService, VersionMapper, PrismaService, InterceptorGrpcHelperProvider, TeamRepository],
})
export class VersionModule {}
