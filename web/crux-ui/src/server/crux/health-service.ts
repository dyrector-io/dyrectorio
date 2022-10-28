import { Logger } from '@app/logger'
import { CruxHealth, DEFAULT_CRUX_HEALTH } from '@app/models'
import { Empty } from '@app/models/grpc/protobuf/proto/common'
import { CruxHealthClient, HealthResponse } from '@app/models/grpc/protobuf/proto/crux'
import { protomisify } from '@server/crux/grpc-connection'
import serviceStatusToDto from './mappers/health-mappers'

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
    } catch (err) {
      this.logger.error('Health check', err)
      return DEFAULT_CRUX_HEALTH
    }
  }
}

export default DyoHealthService
