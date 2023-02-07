import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Configuration, MetadataApi } from '@ory/kratos-client'
import { HealthResponse, ServiceStatus } from 'src/grpc/protobuf/proto/crux'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class HealthService {
  private logger = new Logger(HealthService.name)

  private meta: MetadataApi

  constructor(private prisma: PrismaService, private configService: ConfigService) {
    const kratosConfig = new Configuration({
      basePath: this.configService.get<string>('KRATOS_ADMIN_URL'),
    })
    this.meta = new MetadataApi(kratosConfig)
  }

  async getHealth(): Promise<HealthResponse> {
    let lastMigration: string = null
    try {
      lastMigration = await this.prisma.findLastMigration()
    } catch (err) {
      const error: Error = err

      this.logger.error(`Failed to query the last migration from the database: ${error?.message}`, error?.stack)
    }

    const version = this.configService.get<string>('npm_package_version')

    return {
      cruxVersion: version,
      status: lastMigration ? ServiceStatus.OPERATIONAL : ServiceStatus.DISRUPTED,
      lastMigration,
    }
  }

  async getKratosHealth(): Promise<ServiceStatus> {
    try {
      const readyRes = await this.meta.isReady()
      if (readyRes.status !== 200) {
        return ServiceStatus.DISRUPTED
      }

      const aliveRes = await this.meta.isAlive()
      if (aliveRes.status !== 200) {
        return ServiceStatus.UNAVAILABLE
      }

      return ServiceStatus.OPERATIONAL
    } catch (err) {
      this.logger.error(err)
      return ServiceStatus.UNAVAILABLE
    }
  }

  async getServiceStatus(service: string): Promise<ServiceStatus> {
    if (!service || service === '' || service === 'db') {
      const health = await this.getHealth()
      return !service || service === ''
        ? health.status
        : health.lastMigration
        ? ServiceStatus.OPERATIONAL
        : ServiceStatus.UNAVAILABLE
    }
    if (service === 'kratos') {
      return await this.getKratosHealth()
    }

    return null
  }
}
