import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoMessage from '@app/elements/dyo-message'
import {
  Instance,
  InstanceContainerConfig,
  mergeConfigs,
  PatchInstanceMessage,
  WS_TYPE_PATCH_INSTANCE,
} from '@app/models'
import { getValidationError, instanceConfigSchema } from '@app/validations'
import WebSocketClientEndpoint from '@app/websockets/websocket-client-endpoint'
import useTranslation from 'next-translate/useTranslation'
import { useEffect, useState } from 'react'
import EditImageHeading from '../../images/edit-image-heading'
import EditInstanceConfig from './edit-instance-config'
import EditInstanceJson from './edit-instance-json'

export type EditInstanceCardSelection = 'config' | 'json'

interface EditInstanceCardProps {
  disabled?: boolean
  instance: Instance
  publicKey?: string
  deploymentSock: WebSocketClientEndpoint
}

const EditInstanceCard = (props: EditInstanceCardProps) => {
  const { t } = useTranslation('images')

  const { disabled, instance, deploymentSock: sock, publicKey } = props

  const [selection, setSelection] = useState<EditInstanceCardSelection>('config')
  const [mergedConfig, setMergedConfig] = useState(mergeConfigs(instance.image.config, instance.overriddenConfig))
  const [parseError, setParseError] = useState<string>(null)

  useEffect(
    () => setMergedConfig(mergeConfigs(instance.image.config, instance.overriddenConfig)),
    [instance.image.config, instance.overriddenConfig],
  )

  const onPatch = (id: string, config: Partial<InstanceContainerConfig>) => {
    setParseError(null)

    sock.send(WS_TYPE_PATCH_INSTANCE, {
      ...config,
      instanceId: id,
    } as PatchInstanceMessage)
  }

  const onParseError = (err: Error) => setParseError(err.message)

  const errorMessage = parseError ?? getValidationError(instanceConfigSchema, mergedConfig)?.message

  return (
    <DyoCard className="flex flex-col flex-grow px-6 pb-6 pt-4">
      <div className="flex mb-2 flex-row items-center">
        <EditImageHeading
          imageName={instance.image.name}
          imageTag={instance.image.tag}
          containerName={instance.image.config.name}
        />

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

      {errorMessage ? (
        <DyoMessage message={errorMessage} className="text-xs italic w-full" messageType="error" />
      ) : null}

      <div className="flex flex-col mt-2 h-128">
        {selection === 'config' ? (
          <EditInstanceConfig
            disabled={disabled}
            disabledContainerNameEditing
            config={mergedConfig}
            publicKey={publicKey}
            onPatch={it => onPatch(instance.id, it)}
          />
        ) : (
          <EditInstanceJson
            disabled={disabled}
            disabledContainerNameEditing
            config={mergedConfig}
            onPatch={it => onPatch(instance.id, it)}
            onParseError={onParseError}
          />
        )}
      </div>
    </DyoCard>
  )
}

export default EditInstanceCard
