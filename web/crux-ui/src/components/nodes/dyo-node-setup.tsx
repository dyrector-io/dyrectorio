import { DyoButton } from '@app/elements/dyo-button'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import { DyoTextArea } from '@app/elements/dyo-text-area'
import RemainingTimeLabel from '@app/elements/remaining-time-label'
import { defaultApiErrorHandler } from '@app/errors'
import { useTimer } from '@app/hooks/use-timer'
import { DyoNodeDetails, DyoNodeInstall } from '@app/models'
import { nodeSetupApiUrl } from '@app/routes'
import { writeToClipboard } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import React from 'react'
import DyoNodeConnectionInfo from './dyo-node-connection-info'

interface DyoNodeSetupProps {
  node: DyoNodeDetails
  onNodeInstallChanged: (install: DyoNodeInstall) => void
}

const DyoNodeSetup = (props: DyoNodeSetupProps) => {
  const { t } = useTranslation('nodes')

  const { node } = props

  const [remaining, startCountdown, cancelCountdown] = useTimer(
    node.install ? expiresIn(new Date(node.install.expireAt)) : null,
    () => props.onNodeInstallChanged(null),
  )

  const handleApiError = defaultApiErrorHandler(t)

  const onGenerateInstallScript = async () => {
    const res = await fetch(nodeSetupApiUrl(node.id), {
      method: 'POST',
    })

    if (!res.ok) {
      await handleApiError(res)
      return
    }

    const install = (await res.json()) as DyoNodeInstall

    startCountdown(expiresIn(new Date(install.expireAt)))

    props.onNodeInstallChanged(install)
  }

  const onDiscard = async () => {
    const res = await fetch(nodeSetupApiUrl(node.id), {
      method: 'DELETE',
    })

    if (!res.ok) {
      await handleApiError(res)
      return
    }

    cancelCountdown()
    props.onNodeInstallChanged(null)
  }

  const onCopyScript = () => writeToClipboard(t, node.install.command)

  const now = new Date().getTime()
  const runningSince =
    node.connectedAt && node.status === 'running' ? (now - new Date(node.connectedAt).getTime()) / 1000 / 1000 : null

  return (
    <>
      {!node.install ? (
        <div>
          <DyoButton className="px-4 py-2 mt-4 mr-auto" onClick={onGenerateInstallScript}>
            {t('installScript')}
          </DyoButton>
        </div>
      ) : (
        <>
          <div className="flex flex-col mt-2">
            <DyoInput
              label={t('command')}
              className="bg-gray-900"
              grow
              defaultValue={node.install.command}
              onFocus={ev => ev.target.select()}
            />

            <div className="flex flex-row">
              <DyoLabel className="text-white mr-2">{t('scriptExpiresIn')}</DyoLabel>
              <RemainingTimeLabel textColor="text-dyo-turquoise" seconds={remaining} />
            </div>
          </div>

          <div className="flex flex-row mt-4">
            <DyoButton className="px-4 py-2 mr-4" secondary onClick={onDiscard}>
              {t('common:discard')}
            </DyoButton>

            <DyoButton className="px-4 py-2 mr-auto" outlined onClick={onCopyScript}>
              {t('common:copy')}
            </DyoButton>
          </div>

          <DyoTextArea label={t('script')} grow className="bg-gray-900 h-48 mb-4" defaultValue={node.install.script} />
        </>
      )}

      <DyoNodeConnectionInfo node={node} />
    </>
  )
}

export default DyoNodeSetup

const expiresIn = (expireAt: Date): number => {
  const now = new Date().getTime()
  return (expireAt.getTime() - now) / 1000
}
