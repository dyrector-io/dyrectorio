import { DyoApiErrorHandler } from '@app/errors'
import { DeploymentDetails } from '@app/models'
import { deploymentApiUrl } from '@app/routes'
import { useState } from 'react'

type UseCopyDeploymentStateOptions = {
  handleApiError: DyoApiErrorHandler
}

const useCopyDeploymentState = (
  options: UseCopyDeploymentStateOptions,
): [DeploymentDetails, (deploymentId: string | null) => Promise<void>] => {
  const [target, setTarget] = useState<DeploymentDetails>(null)
  const { handleApiError } = options

  const setCopyTarget = async (deploymentId: string | null) => {
    if (!deploymentId) {
      setTarget(null)
      return
    }

    const res = await fetch(deploymentApiUrl(deploymentId))
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
