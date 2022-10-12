import { DyoConfirmationModal, DyoConfirmationModalConfig } from '@app/elements/dyo-modal'
import { CopyDeploymentResponse } from '@app/models'
import { deploymentCopyUrl } from '@app/routes'
import useTranslation from 'next-translate/useTranslation'
import useConfirmation from './use-confirmation'

export type DeploymentCopyFunc = (productId: string, versionId: string, deploymentId: string) => Promise<string>

export interface DeploymentCopyHook {
  confirmationModal: DyoConfirmationModalConfig
  copy: DeploymentCopyFunc
}

const useDeploymentCopy = (): DeploymentCopyHook => {
  const [confirmationModal, confirmOverwrite] = useConfirmation()

  const postCopy = (productId: string, versionId: string, deploymentId: string, force: boolean): Promise<Response> =>
    fetch(deploymentCopyUrl(productId, versionId, deploymentId, force), { method: 'POST' })

  const copy = async (productId, versionId, deploymentId): Promise<string> => {
    const res = await postCopy(productId, versionId, deploymentId, false)
    if (res.ok) {
      return res.json().then(json => (json as CopyDeploymentResponse).id)
    }
    if (res.status === 412) {
      return new Promise((resolve, reject) => {
        confirmOverwrite(
          () => {
            resolve(
              postCopy(productId, versionId, deploymentId, true).then(copyRes =>
                copyRes.json().then(json => (json as CopyDeploymentResponse).id),
              ),
            )
          },
          {
            onCanceled: () => {
              reject()
            },
          },
        )
      })
    }

    throw 'Failed to copy deployment'
  }

  return {
    copy,
    confirmationModal,
  }
}

export interface DeploymentCopyModalProps {
  confirmationModal: DyoConfirmationModalConfig
}

export const DeploymentCopyModal = (props: DeploymentCopyModalProps) => {
  const { confirmationModal } = props

  const { t } = useTranslation('common')

  return (
    <DyoConfirmationModal
      config={confirmationModal}
      title={t('deploymentCopyConflictTitle')}
      description={t('deploymentCopyConflictContent')}
      confirmText={t('continue')}
      className="w-1/4"
      confirmColor="bg-error-red"
    />
  )
}

export default useDeploymentCopy
