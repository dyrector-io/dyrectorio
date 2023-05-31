import { DyoConfirmationModalConfig } from '@app/elements/dyo-modal'
import useConfirmation from '@app/hooks/use-confirmation'
import { Deployment } from '@app/models'
import { deploymentCopyUrl, deploymentUrl } from '@app/routes'
import useTranslation from 'next-translate/useTranslation'

type CopyDeploymentOptions = {
  deploymentId: string
  overwrite?: boolean
}

const postCopyDeployment = async (
  onApiError: (response: Response) => void,
  options: CopyDeploymentOptions,
): Promise<[string, number]> => {
  const { deploymentId, overwrite } = options

  const url = deploymentCopyUrl(deploymentId, overwrite)

  const res = await fetch(url, {
    method: 'POST',
  })

  if (res.status === 412) {
    return [null, res.status]
  }

  if (!res.ok) {
    onApiError(res)
    return null
  }

  const json = (await res.json()) as Deployment
  return [json.id, res.status]
}

const useCopyDeploymentModal = (
  onApiError: (response: Response) => void,
): [DyoConfirmationModalConfig, (options: CopyDeploymentOptions) => Promise<string>] => {
  const [confirmationModal, confirm] = useConfirmation()

  const { t } = useTranslation('common')

  const onCopy = async (options: CopyDeploymentOptions) => {
    let [newDeploymentId, resStatus] = await postCopyDeployment(onApiError, options)

    if (resStatus === 412) {
      const confirmed = await confirm(null, {
        title: t('common:areYouSure'),
        description: t('alreadyPreparingSureOverwrite'),
        confirmText: t('continue'),
      })

      if (!confirmed) {
        return null
      }

      ;[newDeploymentId, resStatus] = await postCopyDeployment(onApiError, {
        ...options,
        overwrite: true,
      })
    }

    return !newDeploymentId ? null : deploymentUrl(newDeploymentId)
  }

  return [confirmationModal, onCopy]
}

export default useCopyDeploymentModal
