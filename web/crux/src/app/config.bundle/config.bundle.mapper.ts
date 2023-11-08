import { Injectable } from '@nestjs/common'
import { ConfigBundle } from '@prisma/client'
import { UniqueKeyValue } from 'src/domain/container'
import { ConfigBundleDetailsDto, ConfigBundleDto } from './config.bundle.dto'

@Injectable()
export default class ConfigBundleMapper {
  listItemToDto(configBundle: ConfigBundle): ConfigBundleDto {
    return {
      id: configBundle.id,
      name: configBundle.name,
      description: configBundle.description,
    }
  }

  detailsToDto(configBundle: ConfigBundle): ConfigBundleDetailsDto {
    return {
      ...this.listItemToDto(configBundle),
      environment: configBundle.data as UniqueKeyValue[],
    }
  }
}
