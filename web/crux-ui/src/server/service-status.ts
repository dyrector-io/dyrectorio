import { SERVICE_STATUS_CHECK_INTERVAL } from '@app/const'
import { ServiceStatus } from '@app/models'
import { getCruxServiceStatus } from './crux/crux'
import { getKratosServiceStatus } from './kratos'

class ServiceStatusChecker {
  private lastCheck = 0
  private lastStatus: ServiceStatus = 'unavailable'
  private checking = false

  constructor(private runCheck: () => Promise<ServiceStatus>) {}

  async status(): Promise<ServiceStatus> {
    const now = new Date().getTime()

    if (now - this.lastCheck > SERVICE_STATUS_CHECK_INTERVAL && !this.checking) {
      this.checking = true
      this.lastCheck = now

      try {
        this.lastStatus = await this.runCheck()
      } catch {
        this.lastStatus = 'unavailable'
      }

      this.checking = false
    }

    return this.lastStatus
  }
}

export type DyoServiceStatusCheckers = {
  crux: ServiceStatusChecker
  kratos: ServiceStatusChecker
}

if (!global._serviceStatus) {
  global._serviceStatus = {
    crux: new ServiceStatusChecker(getCruxServiceStatus),
    kratos: new ServiceStatusChecker(getKratosServiceStatus),
  }
}

const dyoServiceStatus: DyoServiceStatusCheckers = global._serviceStatus
export default dyoServiceStatus
