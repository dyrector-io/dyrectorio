import { Injectable } from '@nestjs/common'
import {
  ContainerConfigData,
  InstanceContainerConfigData,
  MergedContainerConfigData,
  UniqueSecretKeyValue,
  UniqueSecretKey,
} from 'src/shared/models'

@Injectable()
export default class ContainerMapper {
  public mergeSecrets(
    instanceSecrets: UniqueSecretKeyValue[],
    imageSecrets: UniqueSecretKey[],
  ): UniqueSecretKeyValue[] {
    imageSecrets = imageSecrets ?? []
    instanceSecrets = instanceSecrets ?? []

    const overriddenIds: Set<string> = new Set(instanceSecrets?.map(it => it.id))

    const missing: UniqueSecretKeyValue[] = imageSecrets
      .filter(it => !overriddenIds.has(it.id))
      .map(it => ({
        ...it,
        value: '',
        encrypted: false,
        publicKey: null,
      }))

    return [...missing, ...instanceSecrets]
  }

  public mergeConfigs(image: ContainerConfigData, instance: InstanceContainerConfigData): MergedContainerConfigData {
    return {
      // common
      name: instance.name ?? image.name,
      environment: instance.environment ?? image.environment,
      secrets: this.mergeSecrets(instance.secrets, image.secrets),
      user: instance.user ?? image.user,
      tty: instance.tty ?? image.tty,
      portRanges: instance.portRanges ?? image.portRanges,
      args: instance.args ?? image.args,
      commands: instance.commands ?? image.commands,
      expose: instance.expose ?? image.expose,
      configContainer: instance.configContainer ?? image.configContainer,
      ingress: instance.ingress ?? image.ingress,
      volumes: instance.volumes ?? image.volumes,
      initContainers: instance.initContainers ?? image.initContainers,
      capabilities: [], // TODO (@m8vago, @nandor-magyar): caps
      ports: instance.ports ?? image.ports,
      storageSet: instance.storageSet || image.storageSet,
      storageId: instance.storageSet ? instance.storageId : image.storageId,
      storageConfig: instance.storageSet ? instance.storageConfig : image.storageConfig,

      // crane
      customHeaders: instance.customHeaders ?? image.customHeaders,
      proxyHeaders: instance.proxyHeaders ?? image.proxyHeaders,
      extraLBAnnotations: instance.extraLBAnnotations ?? image.extraLBAnnotations,
      healthCheckConfig: instance.healthCheckConfig ?? image.healthCheckConfig,
      resourceConfig: instance.resourceConfig ?? image.resourceConfig,
      useLoadBalancer: instance.useLoadBalancer ?? image.useLoadBalancer,
      deploymentStrategy: instance.deploymentStrategy ?? image.deploymentStrategy,
      labels:
        instance.labels || image.labels
          ? {
              deployment: instance.labels?.deployment ?? image.labels?.deployment ?? [],
              service: instance.labels?.service ?? image.labels?.service ?? [],
              ingress: instance.labels?.ingress ?? image.labels?.ingress ?? [],
            }
          : null,
      annotations:
        image.annotations || instance.annotations
          ? {
              deployment: instance.annotations?.deployment ?? image.annotations?.deployment ?? [],
              service: instance.annotations?.service ?? image.annotations?.service ?? [],
              ingress: instance.annotations?.ingress ?? image.annotations?.ingress ?? [],
            }
          : null,

      // dagent
      logConfig: instance.logConfig ?? image.logConfig,
      networkMode: instance.networkMode ?? image.networkMode,
      restartPolicy: instance.restartPolicy ?? image.restartPolicy,
      networks: instance.networks ?? image.networks,
      dockerLabels: instance.dockerLabels ?? image.dockerLabels,
    }
  }
}
