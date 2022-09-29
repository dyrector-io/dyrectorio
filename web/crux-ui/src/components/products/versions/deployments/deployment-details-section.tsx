import KeyValueInput from '@app/components/shared/key-value-input'
import { DEPLOYMENT_EDIT_WS_REQUEST_DELAY } from '@app/const'
import { useThrottling } from '@app/hooks/use-throttleing'
import { deploymentIsMutable, DeploymentRoot, WS_TYPE_PATCH_DEPLOYMENT_ENV } from '@app/models'
import { UniqueKeyValue } from '@app/models/grpc/protobuf/proto/crux'
import WebSocketClientEndpoint from '@app/websockets/websocket-client-endpoint'
import useTranslation from 'next-translate/useTranslation'
import DeploymentDetailsCard from './deployment-details-card'

interface DeploymentDetailsSectionProps {
  deployment: DeploymentRoot
  deploySock: WebSocketClientEndpoint
}

const DeploymentDetailsSection = (props: DeploymentDetailsSectionProps) => {
  const { t } = useTranslation('deployments')

  const { deployment, deploySock: sock } = props

  const mutable = deploymentIsMutable(deployment.status)

  const throttle = useThrottling(DEPLOYMENT_EDIT_WS_REQUEST_DELAY)

  const onEnvChange = (env: UniqueKeyValue[]) => throttle(() => sock.send(WS_TYPE_PATCH_DEPLOYMENT_ENV, env))
  return (
    <DeploymentDetailsCard deployment={deployment}>
      <KeyValueInput
        disabled={!mutable}
        label={t('images:environment').toUpperCase()}
        items={deployment.environment ?? []}
        onChange={onEnvChange}
      />
    </DeploymentDetailsCard>
  )
}

export default DeploymentDetailsSection
