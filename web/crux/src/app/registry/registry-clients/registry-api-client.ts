import {
  CruxBadRequestException,
  CruxInternalServerErrorException,
  CruxUnauthorizedException,
} from 'src/exception/crux-exception'
import { RegistryImageTags } from '../registry.message'

export interface RegistryApiClient {
  catalog(text: string): Promise<string[]>
  tags(image: string): Promise<RegistryImageTags>
}

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
