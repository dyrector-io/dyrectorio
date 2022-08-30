import { DyoButton } from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { Instance, PatchInstanceMessage, WS_TYPE_PATCH_INSTANCE } from '@app/models'
import { InstanceContainerConfig, mergeConfigs } from '@app/models-config'
import { getValidationError } from '@app/validation'
import { WebSocketEndpoint } from '@app/websockets/client'
import useTranslation from 'next-translate/useTranslation'
import { useEffect, useState } from 'react'
import EditImageConfig from '../../images/edit-image-config'
import EditImageHeading from '../../images/edit-image-heading'
import EditImageJson from '../../images/edit-image-json'
import { containerConfigSchema } from '@dyrectorio/common'

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

  const errorMessage = parseError ?? getValidationError(containerConfigSchema, mergedConfig)?.message

  return (
    <DyoCard className="flex flex-col flex-grow px-6 pb-6 pt-4">
      <div className="flex flex-row items-center">
        <EditImageHeading
          imageName={instance.image.name}
          imageTag={instance.image.tag}
          containerName={instance.image.config.name}
          errorMessage={errorMessage}
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

      {selection === 'config' ? (
        <EditImageConfig
          disabled={disabled}
          disabledContainerNameEditing
          config={mergedConfig}
          onPatch={it => onPatch(instance.id, it)}
        />
      ) : (
        <EditImageJson
          disabled={disabled}
          disabledContainerNameEditing
          config={mergedConfig}
          onPatch={it => onPatch(instance.id, it)}
          onParseError={onParseError}
        />
      )}
    </DyoCard>
  )
}

export default EditInstanceCard
