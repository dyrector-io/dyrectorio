import { Injectable } from '@nestjs/common'
import { ConfigBundle, ContainerConfig } from '@prisma/client'
import { ContainerConfigData } from 'src/domain/container'
import ContainerMapper from '../container/container.mapper'
import { ConfigBundleDetailsDto, ConfigBundleDto } from './config.bundle.dto'

@Injectable()
export default class ConfigBundleMapper {
  constructor(private readonly containerMapper: ContainerMapper) {}

  listItemToDto(configBundle: ConfigBundle): ConfigBundleDto {
    return {
      id: configBundle.id,
      name: configBundle.name,
      description: configBundle.description,
    }
  }

  detailsToDto(configBundle: ConfigBundleDetails): ConfigBundleDetailsDto {
    return {
      ...this.listItemToDto(configBundle),
      config: this.containerMapper.configDataToDto(
        configBundle.id,
        'configBundle',
        configBundle.config as any as ContainerConfigData,
      ),
    }
  }
}

type ConfigBundleDetails = ConfigBundle & {
  config?: ContainerConfig
}
