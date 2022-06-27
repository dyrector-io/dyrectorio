import { DyoButton } from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoMessage } from '@app/elements/dyo-message'
import {
  ContainerConfig,
  ExplicitContainerConfigPort,
  ExplicitContainerNetworkMode,
  Instance,
  PatchInstanceMessage,
  WS_TYPE_PATCH_INSTANCE,
} from '@app/models'
import { UniqueKeyValue } from '@app/models/proto/crux'
import { containerConfigSchema, getValidationError } from '@app/validation'
import { WebSocketEndpoint } from '@app/websockets/client'
import useTranslation from 'next-translate/useTranslation'
import React, { useEffect, useState } from 'react'
import EditImageConfig from '../../images/edit-image-config'
import EditImageJson from '../../images/edit-image-json'

export type EditInstanceCardSelection = 'config' | 'json'

interface EditInstanceCardProps {
  disabled?: boolean
  instance: Instance
  deploymentSock: WebSocketEndpoint
}

const EditInstanceCard = (props: EditInstanceCardProps) => {
  const { t } = useTranslation('images')

  const { disabled, instance, deploymentSock: sock } = props

  const [selection, setSelection] = useState<EditInstanceCardSelection>('config')
  const [mergedConfig, setMergedConfig] = useState(mergeConfigs(instance.image.config, instance.config))
  const [parseError, setParseError] = useState<string>(null)

  useEffect(
    () => setMergedConfig(mergeConfigs(instance.image.config, instance.config)),
    [instance.image.config, instance.config],
  )

  const onPatch = (id: string, config: ContainerConfig) => {
    setParseError(null)

    sock.send(WS_TYPE_PATCH_INSTANCE, {
      ...config,
      instanceId: id,
    } as PatchInstanceMessage)
  }

  const onParseError = (err: Error) => {
    setParseError(err.message)
  }

  const errorMessage = parseError ?? getValidationError(containerConfigSchema, mergedConfig)?.message

  return (
    <DyoCard className="flex flex-col flex-grow px-6 pb-6 pt-4">
      <div className="flex flex-row items-center">
        <div>
          <DyoHeading element="h4" className="text-lg text-bright">
            {instance.image.name}
            {instance.image.tag ? ` : ${instance.image.tag}` : null}
          </DyoHeading>

          {errorMessage ? <DyoMessage message={errorMessage} messageType="error" /> : null}
        </div>

        <DyoButton
          text
          thin
          textColor="text-bright"
          underlined={selection === 'config'}
          onClick={() => setSelection('config')}
          className="ml-auto mr-8"
        >
          {t('config')}
        </DyoButton>

        <DyoButton
          text
          thin
          textColor="text-bright"
          underlined={selection === 'json'}
          onClick={() => setSelection('json')}
          className="mr-0"
        >
          {t('json')}
        </DyoButton>
      </div>

      {selection === 'config' ? (
        <EditImageConfig disabled={disabled} id={instance.id} config={mergedConfig} onPatch={onPatch} />
      ) : (
        <EditImageJson
          disabled={disabled}
          id={instance.id}
          config={mergedConfig}
          onPatch={onPatch}
          onParseError={onParseError}
        />
      )}
    </DyoCard>
  )
}

export default EditInstanceCard

const overrideKeyValues = (weak: UniqueKeyValue[], strong: UniqueKeyValue[]): UniqueKeyValue[] => {
  const overridenKeys: Set<string> = new Set(strong?.map(it => it.key))
  return [...(weak?.filter(it => !overridenKeys.has(it.key)) ?? []), ...(strong ?? [])]
}

const overridePorts = (
  weak: ExplicitContainerConfigPort[],
  strong: ExplicitContainerConfigPort[],
): ExplicitContainerConfigPort[] => {
  const overridenPorts: Set<number> = new Set(strong?.map(it => it.internal))
  return [...(weak?.filter(it => !overridenPorts.has(it.internal)) ?? []), ...(strong ?? [])]
}

const overrideNetworkMode = (weak: ExplicitContainerNetworkMode, strong: ExplicitContainerNetworkMode) =>
  strong ?? weak ?? 'none'

const mergeConfigs = (imageConfig: ContainerConfig, instanceConfig: ContainerConfig): ContainerConfig => {
  const envs = overrideKeyValues(imageConfig?.environment, instanceConfig?.environment)
  const caps = overrideKeyValues(imageConfig?.capabilities, instanceConfig?.capabilities)

  return {
    environment: envs,
    capabilities: caps,
    config: {
      ...imageConfig?.config,
      ...instanceConfig?.config,
      networkMode: overrideNetworkMode(imageConfig?.config?.networkMode, instanceConfig?.config?.networkMode),
      ports: overridePorts(imageConfig?.config?.ports, instanceConfig?.config?.ports),
    },
  }
}
