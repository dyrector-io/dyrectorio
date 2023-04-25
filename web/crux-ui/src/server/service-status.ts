import { SERVICE_STATUS_CHECK_INTERVAL } from '@app/const'
import { CruxHealth, DEFAULT_CRUX_HEALTH, DEFAULT_SERVICE_INFO, ServiceInfo } from '@app/models'
import { API_HEALTH } from '@app/routes'
import { getCrux } from './crux-api'
import { getKratosServiceStatus } from './kratos'

class ServiceStatusChecker<T extends ServiceInfo> {
  private lastCheck = 0

  private lastInfo: T

  private checking = false

  constructor(defaultInfo: T, private runCheck: () => Promise<T>) {
    this.lastInfo = defaultInfo
  }

  async info(): Promise<T> {
    const now = new Date().getTime()

    if (now - this.lastCheck > SERVICE_STATUS_CHECK_INTERVAL && !this.checking) {
      this.checking = true
      this.lastCheck = now

      try {
        this.lastInfo = await this.runCheck()
      } catch {
        this.lastInfo.status = 'unavailable'
      }

      this.checking = false
    }

    return this.lastInfo
  }
}

export type DyoServiceStatusCheckers = {
  crux: ServiceStatusChecker<CruxHealth>
  kratos: ServiceStatusChecker<ServiceInfo>
}

if (!global.serviceStatus) {
  const getCruxHealth = async (): Promise<CruxHealth> => await getCrux<CruxHealth>(null, API_HEALTH)

  global.serviceStatus = {
    crux: new ServiceStatusChecker(DEFAULT_CRUX_HEALTH, getCruxHealth),
    kratos: new ServiceStatusChecker(DEFAULT_SERVICE_INFO, getKratosServiceStatus),
  }
}

const dyoServiceStatus: DyoServiceStatusCheckers = global.serviceStatus
export default dyoServiceStatus
