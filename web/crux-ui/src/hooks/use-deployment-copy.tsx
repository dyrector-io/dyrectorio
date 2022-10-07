import { DyoConfirmationModal, DyoConfirmationModalConfig } from "@app/elements/dyo-modal"
import { DeploymentCopyCheckFinishedMessage, DeploymentCopyCheckMessage, DeploymentCopyFinishedMessage, DeploymentCopyMessage, WS_TYPE_COPY_DEPLOYMENT, WS_TYPE_COPY_DEPLOYMENT_CHECK, WS_TYPE_COPY_DEPLOYMENT_CHECK_FINISHED, WS_TYPE_COPY_DEPLOYMENT_FINISHED } from "@app/models"
import { deploymentUrl, deploymentWsUrl } from "@app/routes"
import useTranslation from "next-translate/useTranslation"
import { useRouter } from "next/router"
import { useRef } from "react"
import useConfirmation from "./use-confirmation"
import useWebSocket from "./use-websocket"

const TIMEOUT_MS = 5000

export type DeploymentCopyTrigger = (id: string) => Promise<string>

export interface DeploymentCopyHook {
  confirmationModal: DyoConfirmationModalConfig
  copy: DeploymentCopyTrigger
}

interface State {
  resolve: (id: string) => void
  reject: (reason?: any) => void
  timeout: NodeJS.Timeout
}

const useDeploymentCopy = (productId: string, versionId: string, deploymentId: string): DeploymentCopyHook => {
  const state = useRef<State | undefined>(undefined)

  const router = useRouter()
  const [confirmationModal, confirmOverwrite] = useConfirmation()
  const deploymentSock = useWebSocket(deploymentWsUrl(productId, versionId, deploymentId))

  const createTimeout = () => {
    return setTimeout(() => {
      if (state === undefined) {
        return
      }

      state.current.reject()
      state.current = undefined
    }, TIMEOUT_MS)
  }

  const startTimeout = (): NodeJS.Timeout | null => {
    if (state === undefined) {
      return null
    }

    state.current.timeout = createTimeout()
  }

  deploymentSock.on(WS_TYPE_COPY_DEPLOYMENT_CHECK_FINISHED, (message: DeploymentCopyCheckFinishedMessage) => {
    if (state === undefined) {
      return
    }

    clearTimeout(state.current.timeout)

    if (message.overwritesId === null) {
      deploymentSock.send(WS_TYPE_COPY_DEPLOYMENT, {
        id: message.id
      } as DeploymentCopyMessage)

      startTimeout()
    } else {
      confirmOverwrite(() => {
        deploymentSock.send(WS_TYPE_COPY_DEPLOYMENT, {
          id: message.id
        } as DeploymentCopyMessage)
        
        startTimeout()
      }, {
        onCanceled: () => {
          state.current.reject()
          state.current = undefined
        }
      })
    }
  })

  deploymentSock.on(WS_TYPE_COPY_DEPLOYMENT_FINISHED, (message: DeploymentCopyFinishedMessage) => {
    if (state === undefined) {
      return
    }

    clearTimeout(state.current.timeout)

    state.current.resolve(message.copiedId)
    state.current = undefined

    router.push(deploymentUrl(productId, versionId, message.copiedId))
  })

  const copy = (id: string) => {
    return new Promise<string>((resolve, reject) => {
      if (state !== undefined) {
        reject()
        return
      }

      deploymentSock.send(WS_TYPE_COPY_DEPLOYMENT_CHECK, {
        id
      } as DeploymentCopyCheckMessage)

      state.current = {
        resolve,
        reject,
        timeout: createTimeout()
      }
    })
  }

  return {
    copy,
    confirmationModal
  }
}

export interface DeploymentCopyModalProps {
  confirmationModal: DyoConfirmationModalConfig
}

export const DeploymentCopyModal = (props: DeploymentCopyModalProps) => {
  const { confirmationModal } = props

  const { t } = useTranslation('deployments')

  return <DyoConfirmationModal
    config={confirmationModal}
    title={t('copyConflictTitle')}
    description={t('copyConflictContent')}
    confirmText={t('continue')}
    className="w-1/4"
    confirmColor="bg-error-red"
  />
}

export default useDeploymentCopy
