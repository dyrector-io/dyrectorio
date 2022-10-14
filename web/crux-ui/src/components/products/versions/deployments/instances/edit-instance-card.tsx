import useItemEditorState from '@app/components/editor/use-item-editor-state'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoMessage from '@app/elements/dyo-message'
import { Instance } from '@app/models'
import useTranslation from 'next-translate/useTranslation'
import EditImageHeading from '../../images/edit-image-heading'
import EditImageJson from '../../images/edit-image-json'
import { DeploymentState } from '../use-deployment-state'
import EditInstanceConfig from './edit-instance-config'
import useInstanceState from './use-instance-state'

interface EditInstanceCardProps {
  instance: Instance
  deploymentState: DeploymentState
}

const EditInstanceCard = (props: EditInstanceCardProps) => {
  const { t } = useTranslation('images')
  const { instance, deploymentState } = props
  const { editor, sock } = deploymentState

  const [state, actions] = useInstanceState({
    instance,
    deploymentState,
  })

  const { config } = state
  const { selection, errorMessage } = state

  const editorState = useItemEditorState(editor, sock, instance.id)

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
          onClick={() => actions.selectTab('config')}
          className="ml-auto mr-8"
        >
          {t('config')}
        </DyoButton>

        <DyoButton
          text
          thin
          textColor="text-bright"
          underlined={selection === 'json'}
          onClick={() => actions.selectTab('json')}
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
            config={config}
            publicKey={deploymentState.deployment.publicKey}
            definedSecrets={state.definedSecrets}
            editorOptions={editorState}
            onPatch={it => actions.onPatch(instance.id, it)}
          />
        ) : (
          <EditImageJson
            disabled={!deploymentState.mutable}
            config={config}
            editorOptions={editorState}
            onPatch={it => actions.onPatch(instance.id, it)}
          />
        )}
      </div>
    </DyoCard>
  )
}

export default EditInstanceCard
