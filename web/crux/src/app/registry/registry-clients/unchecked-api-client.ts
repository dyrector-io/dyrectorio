import { CruxBadRequestException } from 'src/exception/crux-exception'
import { RegistryImageTags } from '../registry.message'
import { RegistryApiClient } from './registry-api-client'

class UncheckedApiClient implements RegistryApiClient {
  catalog(): Promise<string[]> {
    throw new CruxBadRequestException({ message: 'Unchecked registries have no catalog API!' })
  }

  tags(): Promise<RegistryImageTags> {
    throw new CruxBadRequestException({ message: 'Unchecked registries have no tags API!' })
  }

  async labels(): Promise<Record<string, string>> {
    return {}
  }
}

export default UncheckedApiClient
