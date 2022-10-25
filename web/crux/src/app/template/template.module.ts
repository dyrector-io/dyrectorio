import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import InterceptorGrpcHelperProvider from 'src/interceptors/helper.interceptor'
import TemplateFileService from 'src/services/template.file.service'
import ProductModule from '../product/product.module'
import TemplateService from './template.service'
import TemplateController from './template.controller'
import VersionModule from '../version/version.module'
import TeamModule from '../team/team.module'
import RegistryModule from '../registry/registry.module'
import ImageModule from '../image/image.module'
import AgentModule from '../agent/agent.module'
import DeployModule from '../deploy/deploy.module'

@Module({
  imports: [
    HttpModule,
    ProductModule,
    VersionModule,
    TeamModule,
    RegistryModule,
    ImageModule,
    AgentModule,
    DeployModule,
  ],
  exports: [TemplateService],
  controllers: [TemplateController],
  providers: [TemplateService, InterceptorGrpcHelperProvider, PrismaService, TemplateFileService],
})
export default class TemplateModule {}
