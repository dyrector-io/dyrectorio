import { CruxBadRequestException } from 'src/exception/crux-exception'
import { RegistryImageWithTags } from '../registry.message'
import { RegistryApiClient, RegistryImageTagInfo } from './registry-api-client'

class UncheckedApiClient implements RegistryApiClient {
  catalog(): Promise<string[]> {
    throw new CruxBadRequestException({ message: 'Unchecked registries have no catalog API!' })
  }

  tags(): Promise<RegistryImageWithTags> {
    throw new CruxBadRequestException({ message: 'Unchecked registries have no tags API!' })
  }

  async labels(): Promise<Record<string, string>> {
    return {}
  }

  async tagInfo(): Promise<RegistryImageTagInfo> {
    return null
  }
}

export default UncheckedApiClient
