import { Dashboard } from '@app/models'
import { AccessRequest, CruxDashboardClient, DashboardResponse } from '@app/models/grpc/protobuf/proto/crux'
import { timestampToUTC } from '@app/utils'
import { Identity } from '@ory/kratos-client'
import { protomisify } from './grpc-connection'

class DyoDashboardService {
  constructor(private client: CruxDashboardClient, private identity: Identity) {}

  async getDashboard(): Promise<Dashboard> {
    const req = {
      accessedBy: this.identity.id,
    } as AccessRequest

    const dashboard = await protomisify<AccessRequest, DashboardResponse>(this.client, this.client.getDashboard)(
      AccessRequest,
      req,
    )

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
