import useItemEditorState from '@app/components/editor/use-item-editor-state'
import { DyoCard } from '@app/elements/dyo-card'
import DyoMessage from '@app/elements/dyo-message'
import {
  Instance,
  instanceConfigToJsonInstanceConfig,
  InstanceJsonContainerConfig,
  mergeJsonConfigToInstanceContainerConfig,
} from '@app/models'
import EditImageHeading from '../../images/edit-image-heading'
import EditImageJson from '../../images/edit-image-json'
import { DeploymentState } from '../use-deployment-state'
import useInstanceState from './use-instance-state'

interface EditInstanceCardProps {
  instance: Instance
  deploymentState: DeploymentState
}

const EditInstanceCard = (props: EditInstanceCardProps) => {
  const { instance, deploymentState } = props
  const { editor, sock } = deploymentState

  const [state, actions] = useInstanceState({
    instance,
    deploymentState,
  })

  const { config, errorMessage } = state

  const editorState = useItemEditorState(editor, sock, instance.id)

  return (
    <DyoCard className="flex flex-col flex-grow px-6 pb-6 pt-4">
      <div className="flex mb-2 flex-row items-center">
        <EditImageHeading
          imageName={instance.image.name}
          imageTag={instance.image.tag}
          containerName={instance.image.config.name}
        />
      </div>

      {errorMessage ? (
        <DyoMessage message={errorMessage} className="text-xs italic w-full" messageType="error" />
      ) : null}

      <div className="flex flex-col mt-2 h-128">
        <EditImageJson
          disabled={!deploymentState.mutable}
          config={config}
          editorOptions={editorState}
          onPatch={(it: InstanceJsonContainerConfig) =>
            actions.onPatch(instance.id, mergeJsonConfigToInstanceContainerConfig(config, it))
          }
          onParseError={actions.onParseError}
          convertConfigToJson={instanceConfigToJsonInstanceConfig}
        />
      </div>
    </DyoCard>
  )
}

export default EditInstanceCard
