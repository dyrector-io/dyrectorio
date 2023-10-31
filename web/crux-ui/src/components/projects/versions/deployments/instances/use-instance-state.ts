import {
  ContainerConfigData,
  ImageConfigProperty,
  Instance,
  InstanceContainerConfigData,
  InstanceSecretsMessage,
  mergeConfigs,
  MergedContainerConfigData,
  PatchInstanceMessage,
  WS_TYPE_INSTANCE_SECRETS,
  WS_TYPE_PATCH_INSTANCE,
} from '@app/models'
import { createContainerConfigSchema, getValidationError } from '@app/validations'
import { useState } from 'react'
import { DeploymentActions, DeploymentState } from '../use-deployment-state'
import useTranslation from 'next-translate/useTranslation'

export type InstanceStateOptions = {
  deploymentState: DeploymentState
  deploymentActions: DeploymentActions
  instance: Instance
}

export type InstanceState = {
  config: MergedContainerConfigData
  resetableConfig: ContainerConfigData
  definedSecrets: string[]
  errorMessage: string
}

export type InstanceActions = {
  resetSection: (section: ImageConfigProperty) => void
  onPatch: (newConfig: Partial<ContainerConfigData>) => void
  onParseError: (error: Error) => void
}

const useInstanceState = (options: InstanceStateOptions) => {
  const { t } = useTranslation('container')

  const { instance, deploymentState, deploymentActions } = options
  const { sock } = deploymentState

  const [parseError, setParseError] = useState<string>(null)
  const [definedSecrets, setDefinedSecrets] = useState<string[]>([])

  sock.on(WS_TYPE_INSTANCE_SECRETS, (message: InstanceSecretsMessage) => {
    if (message.instanceId !== instance.id) {
      return
    }

    setDefinedSecrets(message.keys)
  })

  const mergedConfig = mergeConfigs(instance.image.config, instance.config)

  const errorMessage = parseError ?? getValidationError(createContainerConfigSchema(instance.image.validation), mergedConfig, null, t)?.message

  const resetSection = (section: ImageConfigProperty): InstanceContainerConfigData => {
    const newConfig = { ...instance.config } as any
    newConfig[section] = null

    deploymentActions.updateInstanceConfig(instance.id, newConfig)

    sock.send(WS_TYPE_PATCH_INSTANCE, {
      instanceId: instance.id,
      resetSection: section,
    } as PatchInstanceMessage)

    return newConfig
  }

  const onPatch = (id: string, newConfig: InstanceContainerConfigData) => {
    deploymentActions.onPatchInstance(id, newConfig)
    setParseError(null)
  }

  const onParseError = (err: Error) => setParseError(err.message)

  return [
    {
      config: mergedConfig,
      resetableConfig: instance.config,
      definedSecrets,
      errorMessage,
    },
    {
      onPatch,
      resetSection,
      onParseError,
    },
  ]
}

export default useInstanceState
