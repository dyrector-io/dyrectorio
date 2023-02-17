import {
  ContainerConfigData,
  DeploymentGetSecretListMessage,
  DeploymentSecretListMessage,
  ImageConfigFilterType,
  Instance,
  InstanceContainerConfigData,
  PatchInstanceMessage,
  WS_TYPE_DEPLOYMENT_SECRETS,
  WS_TYPE_GET_DEPLOYMENT_SECRETS,
  WS_TYPE_PATCH_INSTANCE,
} from '@app/models'
import { containerConfigSchema, getValidationError } from '@app/validations'
import { useEffect, useState } from 'react'
import { DeploymentState } from '../use-deployment-state'

export type EditInstanceCardSelection = 'config' | 'json'

export type InstanceStateOptions = {
  deploymentState: DeploymentState
  instance: Instance
}

export type InstanceState = {
  config: ContainerConfigData
  definedSecrets: string[]
  selection: EditInstanceCardSelection
  errorMessage: string
}

export type InstanceActions = {
  selectTab: (selection: EditInstanceCardSelection) => void
  updateConfig: (config: Partial<ContainerConfigData>) => void
  resetSection: (section: ImageConfigFilterType) => ContainerConfigData
  onPatch: (newConfig: Partial<ContainerConfigData>) => void
  onParseError: (error: Error) => void
}

const useInstanceState = (options: InstanceStateOptions) => {
  const { instance, deploymentState } = options
  const { sock } = deploymentState

  const [selection, setSelection] = useState<EditInstanceCardSelection>('config')
  const [config, setConfig] = useState(instance.overriddenConfig)
  const [parseError, setParseError] = useState<string>(null)
  const [definedSecrets, setDefinedSecrets] = useState<string[]>([])

  useEffect(() => setConfig(instance.overriddenConfig), [instance.overriddenConfig])

  useEffect(() => {
    if (selection !== 'config') {
      return
    }

    sock.send(WS_TYPE_GET_DEPLOYMENT_SECRETS, {
      instanceId: instance.id,
    } as DeploymentGetSecretListMessage)
  }, [sock, instance.id, selection])

  sock.on(WS_TYPE_DEPLOYMENT_SECRETS, (message: DeploymentSecretListMessage) => {
    if (message.instanceId !== instance.id) {
      return
    }

    setDefinedSecrets(message.keys)
  })

  const errorMessage = parseError ?? getValidationError(containerConfigSchema, config)?.message

  const updateConfig = (newConfig: Partial<InstanceContainerConfigData>) => setConfig({ ...config, ...newConfig })

  const resetSection = (section: ImageConfigFilterType) => {
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
    setParseError(null)

    sock.send(WS_TYPE_PATCH_INSTANCE, {
      instanceId: id,
      config: newConfig,
    } as PatchInstanceMessage)
  }

  const onParseError = (err: Error) => setParseError(err.message)

  return [
    {
      selection,
      config,
      definedSecrets,
      errorMessage,
    },
    {
      selectTab: setSelection,
      onPatch,
      updateConfig,
      resetSection,
      onParseError,
    },
  ]
}

export default useInstanceState
