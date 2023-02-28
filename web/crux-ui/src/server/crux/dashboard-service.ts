import { Dashboard } from '@app/models'
import { Empty } from '@app/models/grpc/protobuf/proto/common'
import { CruxDashboardClient, DashboardResponse } from '@app/models/grpc/protobuf/proto/crux'
import { timestampToUTC } from '@app/utils'
import { protomisify } from './grpc-connection'

class DyoDashboardService {
  constructor(private client: CruxDashboardClient, private cookie: string) {}

  async getDashboard(): Promise<Dashboard> {
    const dashboard = await protomisify<Empty, DashboardResponse>(
      this.client,
      this.client.getDashboard,
      this.cookie,
    )(Empty, {})

    return {
      ...dashboard,
      latestDeployments: dashboard.latestDeployments.map(it => ({
        ...it,
        deployedAt: timestampToUTC(it.deployedAt),
      })),
      auditLog: dashboard.auditLog.map(it => ({
        identityEmail: it.identityEmail,
        date: timestampToUTC(it.createdAt),
        event: it.serviceCall,
        info: it.data,
      })),
    }
  }
}

export default DyoDashboardService
