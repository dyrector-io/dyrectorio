import useItemEditorState from '@app/components/editor/use-item-editor-state'
import KeyValueInput from '@app/components/shared/key-value-input'
import { DEPLOYMENT_EDIT_WS_REQUEST_DELAY } from '@app/const'
import { useThrottling } from '@app/hooks/use-throttleing'
import { Environment, WS_TYPE_PATCH_DEPLOYMENT_ENV } from '@app/models'
import useTranslation from 'next-translate/useTranslation'
import DeploymentDetailsCard from './deployment-details-card'
import { DeploymentState } from './use-deployment-state'

interface DeploymentDetailsSectionProps {
  state: DeploymentState
}

const ITEM_ID = 'deployment'

const DeploymentDetailsSection = (props: DeploymentDetailsSectionProps) => {
  const { t } = useTranslation('deployments')

  const { state } = props
  const { deployment, mutable, editor, sock } = state

  const editorState = useItemEditorState(editor, sock, ITEM_ID)

  const throttle = useThrottling(DEPLOYMENT_EDIT_WS_REQUEST_DELAY)

  const onEnvChange = (env: Environment) => throttle(() => sock.send(WS_TYPE_PATCH_DEPLOYMENT_ENV, env))

  return (
    <DeploymentDetailsCard state={state}>
      <KeyValueInput
        disabled={!mutable}
        editorOptions={editorState}
        heading={t('images:environment').toUpperCase()}
        items={deployment.environment ?? []}
        onChange={onEnvChange}
      />
    </DeploymentDetailsCard>
  )
}

export default DeploymentDetailsSection
