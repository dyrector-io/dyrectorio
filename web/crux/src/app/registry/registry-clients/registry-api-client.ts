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
