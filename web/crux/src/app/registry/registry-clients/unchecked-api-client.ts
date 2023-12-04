import { CruxBadRequestException } from 'src/exception/crux-exception'
import { RegistryImageTags } from '../registry.message'
import { RegistryApiClient } from './registry-api-client'

class UncheckedApiClient implements RegistryApiClient {
  constructor(private url: string) {}

  catalog(): Promise<string[]> {
    throw new CruxBadRequestException({ message: 'Unchecked registries have no catalog API' })
  }

  tags(): Promise<RegistryImageTags> {
    throw new CruxBadRequestException({ message: 'Unchecked registries have no tags API' })
  }

  labels(): Promise<Record<string, string>> {
    throw new CruxBadRequestException({ message: 'Unchecked registries have no labels API' })
  }
}

export default UncheckedApiClient
