import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { ConfigBundle, ContainerConfig } from '@prisma/client'
import { ContainerConfigData } from 'src/domain/container'
import ContainerMapper from '../container/container.mapper'
import { ConfigBundleDetailsDto, ConfigBundleDto } from './config.bundle.dto'

@Injectable()
export default class ConfigBundleMapper {
  constructor(
    @Inject(forwardRef(() => ContainerMapper))
    private readonly containerMapper: ContainerMapper,
  ) {}

  toDto(it: ConfigBundle): ConfigBundleDto {
    return {
      id: it.id,
      name: it.name,
      description: it.description,
      configId: it.configId,
    }
  }

  detailsToDto(configBundle: ConfigBundleDetails): ConfigBundleDetailsDto {
    return {
      ...this.toDto(configBundle),
      config: this.containerMapper.configDataToDto(
        configBundle.configId,
        'configBundle',
        configBundle.config as any as ContainerConfigData,
      ),
    }
  }
}

type ConfigBundleDetails = ConfigBundle & {
  config: ContainerConfig
}
