import { DyoConfirmationModal, DyoConfirmationModalConfig } from '@app/elements/dyo-modal'
import { CheckDeploymentCopyResponse, CopyDeploymentResponse } from '@app/models'
import { deploymentCopyUrl } from '@app/routes'
import useTranslation from 'next-translate/useTranslation'
import useConfirmation from './use-confirmation'

export type DeploymentCopyTrigger = (productId: string, versionId: string, deploymentId: string) => Promise<string>

export interface DeploymentCopyHook {
  confirmationModal: DyoConfirmationModalConfig
  copy: DeploymentCopyTrigger
}

const useDeploymentCopy = (): DeploymentCopyHook => {
  const [confirmationModal, confirmOverwrite] = useConfirmation()

  const performCopy = async (productId, versionId, deploymentId) => {
    const res = await fetch(deploymentCopyUrl(productId, versionId, deploymentId), {
      method: 'POST',
    })
    if (!res.ok) {
      throw 'Failed to copy deployment!'
    }

    const copy = (await res.json()) as CopyDeploymentResponse

    return copy.id
  }

  const copy = (productId, versionId, deploymentId): Promise<string> =>
    new Promise(async (resolve, reject) => {
      const res = await fetch(deploymentCopyUrl(productId, versionId, deploymentId))
      if (!res.ok) {
        reject('Failed to check deployment copy')
        return
      }

      const checkCopy = (await res.json()) as CheckDeploymentCopyResponse
      if (checkCopy.pendingDeployment) {
        confirmOverwrite(
          () => {
            resolve(performCopy(productId, versionId, deploymentId))
          },
          {
            onCanceled: () => {
              reject()
            },
          },
        )
      } else {
        resolve(performCopy(productId, versionId, deploymentId))
      }
    })

  return {
    copy: copy,
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
