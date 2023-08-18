import { DyoApiErrorHandler } from '@app/errors'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { DeploymentDetails } from '@app/models'
import { useState } from 'react'

type UseCopyDeploymentStateOptions = {
  handleApiError: DyoApiErrorHandler
}

const useCopyDeploymentState = (
  options: UseCopyDeploymentStateOptions,
): [DeploymentDetails, (deploymentId: string | null) => Promise<void>] => {
  const routes = useTeamRoutes()

  const [target, setTarget] = useState<DeploymentDetails>(null)
  const { handleApiError } = options

  const setCopyTarget = async (deploymentId: string | null) => {
    if (!deploymentId) {
      setTarget(null)
      return
    }

    const res = await fetch(routes.deployment.api.details(deploymentId))
    if (!res.ok) {
      handleApiError(res)
      return
    }

    const deployment = (await res.json()) as DeploymentDetails

    setTarget(deployment)
  }

  return [target, setCopyTarget]
}

export default useCopyDeploymentState
