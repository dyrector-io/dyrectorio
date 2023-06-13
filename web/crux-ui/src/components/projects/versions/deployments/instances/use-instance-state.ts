import {
  ContainerConfigData,
  ImageConfigProperty,
  Instance,
  InstanceContainerConfigData,
  InstanceSecretsMessage,
  mergeConfigs,
  PatchInstanceMessage,
  WS_TYPE_INSTANCE_SECRETS,
  WS_TYPE_PATCH_INSTANCE,
} from '@app/models'
import { containerConfigSchema, getValidationError } from '@app/validations'
import { useEffect, useState } from 'react'
import { DeploymentActions, DeploymentState } from '../use-deployment-state'

export type InstanceStateOptions = {
  deploymentState: DeploymentState
  deploymentActions: DeploymentActions
  instance: Instance
}

export type InstanceState = {
  config: ContainerConfigData
  resetableConfig: ContainerConfigData
  definedSecrets: string[]
  errorMessage: string
}

export type InstanceActions = {
  updateConfig: (config: Partial<ContainerConfigData>) => void
  resetSection: (section: ImageConfigProperty) => ContainerConfigData
  onPatch: (newConfig: Partial<ContainerConfigData>) => void
  onParseError: (error: Error) => void
}

const useInstanceState = (options: InstanceStateOptions) => {
  const { instance, deploymentState, deploymentActions } = options
  const { sock } = deploymentState

  const [config, setConfig] = useState(instance.config)
  const [parseError, setParseError] = useState<string>(null)
  const [definedSecrets, setDefinedSecrets] = useState<string[]>([])

  useEffect(() => setConfig(instance.config), [instance.config])

  sock.on(WS_TYPE_INSTANCE_SECRETS, (message: InstanceSecretsMessage) => {
    if (message.instanceId !== instance.id) {
      return
    }

    setDefinedSecrets(message.keys)
  })

  const mergedConfig = mergeConfigs(instance.image.config, config)

  const errorMessage = parseError ?? getValidationError(containerConfigSchema, mergedConfig)?.message

  const updateConfig = (newConfig: Partial<InstanceContainerConfigData>) => setConfig({ ...config, ...newConfig })

  const resetSection = (section: ImageConfigProperty) => {
    const newConfig = { ...config } as any
    newConfig[section] = null

    setConfig(newConfig)

    sock.send(WS_TYPE_PATCH_INSTANCE, {
      instanceId: instance.id,
      resetSection: section,
    } as PatchInstanceMessage)

    return newConfig
  }

  const onPatch = (id: string, newConfig: InstanceContainerConfigData) => {
    setConfig({
      ...config,
      ...newConfig,
    })

    deploymentActions.onPatchInstance(id, newConfig)
    setParseError(null)
  }

  const onParseError = (err: Error) => setParseError(err.message)

  return [
    {
      config: mergedConfig,
      resetableConfig: config,
      definedSecrets,
      errorMessage,
    },
    {
      onPatch,
      updateConfig,
      resetSection,
      onParseError,
    },
  ]
}

export default useInstanceState
