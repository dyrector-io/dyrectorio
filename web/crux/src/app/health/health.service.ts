import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Configuration, MetadataApi } from '@ory/kratos-client'
import { NotFoundException } from 'src/exception/errors'
import { HealthResponse, ServiceStatus } from 'src/grpc/protobuf/proto/crux'
import { HealthCheckRequest, HealthCheckResponse } from 'src/grpc/protobuf/proto/health'
import PrismaService from 'src/services/prisma.service'
import { SERVICE_CRUX, SERVICE_DATABASE, SERVICE_KRATOS } from 'src/shared/models'
import HealthMapper from './health.mapper'

@Injectable()
export default class HealthService {
  private logger = new Logger(HealthService.name)

  private meta: MetadataApi

  constructor(private prisma: PrismaService, private configService: ConfigService, private mapper: HealthMapper) {
    const kratosConfig = new Configuration({
      basePath: this.configService.get<string>('KRATOS_ADMIN_URL'),
    })
    this.meta = new MetadataApi(kratosConfig)
  }

  async getCruxHealth(): Promise<HealthResponse> {
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

  async getHealthCheck(request: HealthCheckRequest): Promise<HealthCheckResponse> {
    const { service } = request

    const status = await this.getServiceStatus(service)

    return { status: this.mapper.serviceStatusToProto(status) }
  }

  private async getServiceStatus(service: string): Promise<ServiceStatus> {
    if (service === SERVICE_KRATOS) {
      return await this.getKratosHealth()
    }

    const health = await this.getCruxHealth()

    if (service === SERVICE_DATABASE) {
      return health.lastMigration ? ServiceStatus.OPERATIONAL : ServiceStatus.UNAVAILABLE
    }

    if (service === SERVICE_CRUX || !service || service === '') {
      return health.status
    }

    throw new NotFoundException({
      property: 'service',
      value: service,
      message: 'Service not found',
    })
  }

  private async getKratosHealth(): Promise<ServiceStatus> {
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
}
