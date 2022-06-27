import { Logger } from '@app/logger'
import { CruxHealthClient, Empty } from '@app/models/proto/crux'
import { protomisify } from '@server/crux/grpc-connection'

class DyoHealthService {
  private logger = new Logger(DyoHealthService.name)

  constructor(private client: CruxHealthClient) {}

  async getHealth(): Promise<boolean> {
    const req: Empty = {}

    try {
      await protomisify<Empty, Empty>(this.client, this.client.getHealth)(Empty, req)
    } catch (e) {
      this.logger.debug('Health check', e)
      return false
    }

    return true
  }
}

export default DyoHealthService
