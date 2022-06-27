import { Module } from '@nestjs/common'
import { AgentModule } from './app/agent/agent.module'
import { AuditModule } from './app/audit/audit.module'
import { DeployModule } from './app/deploy/deploy.module'
import { HealthModule } from './app/health/health.module'
import { ImageModule } from './app/image/image.module'
import { NodeModule } from './app/node/node.module'
import { ProductModule } from './app/product/product.module'
import { RegistryModule } from './app/registry/registry.module'
import { TeamModule } from './app/team/team.module'
import { VersionModule } from './app/version/version.module'
import { ShutdownService } from './application.shutdown.service'
import { ConfigModule } from './config/config.module'
import { InterceptorGrpcHelperProvider } from './interceptors/helper.interceptor'

@Module({
  imports: [
    ProductModule,
    ConfigModule,
    RegistryModule,
    NodeModule,
    VersionModule,
    ImageModule,
    TeamModule,
    DeployModule,
    AgentModule,
    AuditModule,
    HealthModule,
  ],
  controllers: [],
  providers: [ShutdownService, InterceptorGrpcHelperProvider],
})
export class AppModule {}
