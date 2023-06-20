/* eslint-disable import/prefer-default-export */
import { CruxBadRequestException, CruxInternalServerErrorException, CruxUnauthorizedException } from './crux-exception'

export const getRegistryApiException = (res: Response, endpoint: string) => {
  switch (res.status) {
    case 401:
      return new CruxUnauthorizedException({
        message: `${endpoint} unauthorized: ${res.status} ${res.statusText}`,
        property: 'registryUnauthorized',
      })
    case 429:
      return new CruxBadRequestException({
        message: `${endpoint} rate limit reached: ${res.status} ${res.statusText}`,
        property: 'registryRateLimit',
      })
    default:
      return new CruxInternalServerErrorException({
        message: `${endpoint} failed with status: ${res.status} ${res.statusText}`,
      })
  }
}
