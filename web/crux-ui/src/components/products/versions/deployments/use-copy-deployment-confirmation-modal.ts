import { DyoConfirmationModalConfig } from '@app/elements/dyo-modal'
import useConfirmation from '@app/hooks/use-confirmation'
import { CopyDeploymentResponse } from '@app/models'
import { deploymentCopyUrl, deploymentUrl } from '@app/routes'
import useTranslation from 'next-translate/useTranslation'

type CopyDeploymentOptions = {
  productId: string
  versionId: string
  deploymentId: string
}

const postCopyDeployment = async (
  onApiError: (response: Response) => void,
  options: CopyDeploymentOptions & {
    overwrite?: boolean
  },
): Promise<[string, number]> => {
  const { productId, versionId, deploymentId, overwrite } = options

  const url = deploymentCopyUrl(productId, versionId, deploymentId, overwrite)

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

  const json = (await res.json()) as CopyDeploymentResponse
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

    return !newDeploymentId ? null : deploymentUrl(options.productId, options.versionId, newDeploymentId)
  }

  return [confirmationModal, onCopy]
}

export default useCopyDeploymentModal
