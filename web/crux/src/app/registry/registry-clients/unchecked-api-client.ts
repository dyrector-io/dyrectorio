import { RegistryImageTags } from '../registry.message'
import { RegistryApiClient } from './registry-api-client'
import V2Labels from './v2-labels'
import { CruxBadRequestException } from 'src/exception/crux-exception'

class UncheckedApiClient implements RegistryApiClient {
  constructor(private url: string) { }

  catalog(_: string): Promise<string[]> {
    throw new CruxBadRequestException({ message: 'Unchecked registries have no catalog API' })
  }

  tags(_: string): Promise<RegistryImageTags> {
    throw new CruxBadRequestException({ message: 'Unchecked registries have no tags API' })
  }

  async labels(image: string, tag: string): Promise<Record<string, string>> {
    if (this.url === "") {
      return {}
    }

    const labelClient = new V2Labels(this.url)
    return labelClient.fetchLabels(image, tag)
  }
}

export default UncheckedApiClient
