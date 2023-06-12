import useItemEditorState from '@app/components/editor/use-item-editor-state'
import KeyValueInput from '@app/components/shared/key-value-input'
import useTranslation from 'next-translate/useTranslation'
import DeploymentDetailsCard from './deployment-details-card'
import { DeploymentActions, DeploymentState } from './use-deployment-state'

interface DeploymentDetailsSectionProps {
  className?: string
  state: DeploymentState
  actions: DeploymentActions
}

const ITEM_ID = 'deployment'

const DeploymentDetailsSection = (props: DeploymentDetailsSectionProps) => {
  const { t } = useTranslation('deployments')

  const { state, actions, className } = props
  const { deployment, mutable, editor, sock } = state
  const { onEnvironmentEdited } = actions

  const editorState = useItemEditorState(editor, sock, ITEM_ID)

  return (
    <DeploymentDetailsCard className={className} deployment={deployment}>
      <KeyValueInput
        className="max-h-128 overflow-y-auto"
        disabled={!mutable}
        editorOptions={editorState}
        label={t('images:environment').toUpperCase()}
        items={deployment.environment ?? []}
        onChange={onEnvironmentEdited}
      />
    </DeploymentDetailsCard>
  )
}

export default DeploymentDetailsSection
