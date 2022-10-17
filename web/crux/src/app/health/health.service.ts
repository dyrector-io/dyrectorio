import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HealthResponse, ServiceStatus } from 'src/grpc/protobuf/proto/crux'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class HealthService {
  private logger = new Logger(HealthService.name)

  constructor(private prisma: PrismaService, private configService: ConfigService) {}

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
}
