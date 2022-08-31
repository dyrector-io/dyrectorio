import { Logger } from '@app/logger'
import { CruxHealth, DEFAULT_CRUX_HEALTH } from '@app/models'
import { CruxHealthClient, Empty, HealthResponse } from '@app/models/grpc/protobuf/proto/crux'
import { protomisify } from '@server/crux/grpc-connection'
import serviceStatusToDto from './mappers/health-mapper'

class DyoHealthService {
  private logger = new Logger(DyoHealthService.name)

  constructor(private client: CruxHealthClient) {}

  async getHealth(): Promise<CruxHealth> {
    const req: Empty = {}

    try {
      const res = await protomisify<Empty, HealthResponse>(this.client, this.client.getHealth)(Empty, req)
      return {
        status: serviceStatusToDto(res.status),
        version: res.cruxVersion,
        lastMigration: res.lastMigration,
      }
    } catch (e) {
      this.logger.error('Health check', e)
      return DEFAULT_CRUX_HEALTH
    }
  }
}

export default DyoHealthService
