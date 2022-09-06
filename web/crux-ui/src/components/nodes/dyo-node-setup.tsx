import DyoButton from '@app/elements/dyo-button'
import DyoChips from '@app/elements/dyo-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import RemainingTimeLabel from '@app/elements/remaining-time-label'
import { defaultApiErrorHandler } from '@app/errors'
import useTimer from '@app/hooks/use-timer'
import { DyoNodeDetails, DyoNodeInstall, NodeType, NODE_TYPE_VALUES } from '@app/models'
import { nodeSetupApiUrl } from '@app/routes'
import { sendForm, writeToClipboard } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import ShEditor from '../shared/sh-editor'
import DyoNodeConnectionInfo from './dyo-node-connection-info'

const expiresIn = (expireAt: Date): number => {
  const now = new Date().getTime()
  return (expireAt.getTime() - now) / 1000
}

interface DyoNodeSetupProps {
  node: DyoNodeDetails
  onNodeInstallChanged: (install: DyoNodeInstall) => void
  onNodeTypeChanged: (type: NodeType) => void
}

const DyoNodeSetup = (props: DyoNodeSetupProps) => {
  const { t } = useTranslation('nodes')

  const { node, onNodeTypeChanged, onNodeInstallChanged } = props

  const [remaining, startCountdown, cancelCountdown] = useTimer(
    node.install ? expiresIn(new Date(node.install.expireAt)) : null,
    () => onNodeInstallChanged(null),
  )

  const handleApiError = defaultApiErrorHandler(t)

  const onGenerateInstallScript = async () => {
    const body = {
      type: node.type,
    }

    const res = await sendForm('POST', nodeSetupApiUrl(node.id), body)

    if (!res.ok) {
      await handleApiError(res)
      return
    }

    const install = (await res.json()) as DyoNodeInstall

    startCountdown(expiresIn(new Date(install.expireAt)))

    onNodeInstallChanged(install)
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
    onNodeInstallChanged(null)
  }

  const onCopyScript = () => writeToClipboard(t, node.install.command)

  return (
    <>
      {!node.install ? (
        <div className="mb-4">
          <DyoHeading element="h4" className="text-lg text-bright mb-2">
            {t('technology')}
          </DyoHeading>

          <DyoChips
            className="mb-2 ml-2"
            choices={NODE_TYPE_VALUES}
            initialSelection={node.type}
            converter={(it: NodeType) => t(`technologies.${it}`)}
            onSelectionChange={it => onNodeTypeChanged(it)}
          />

          <DyoButton className="px-4 py-2 mt-4 mr-auto" onClick={onGenerateInstallScript}>
            {t('generateScript')}
          </DyoButton>
        </div>
      ) : (
        <>
          <div className="flex flex-col">
            <DyoInput
              label={t('command')}
              className="bg-gray-900"
              disabled
              grow
              defaultValue={node.install.command}
              onFocus={ev => ev.target.select()}
            />

            <div className="flex flex-row">
              <DyoLabel className="text-white mr-2">{t('scriptExpiresIn')}</DyoLabel>
              <RemainingTimeLabel textColor="text-dyo-turquoise" seconds={remaining} />
            </div>
          </div>

          <div className="flex flex-row mt-4 mb-4">
            <DyoButton className="px-4 py-2 mr-4" secondary onClick={onDiscard}>
              {t('common:discard')}
            </DyoButton>

            <DyoButton className="px-4 py-2 mr-auto" outlined onClick={onCopyScript}>
              {t('common:copy')}
            </DyoButton>
          </div>

          <div className="flex flex-col">
            <DyoLabel className="mb-2.5">{t('script')}</DyoLabel>
            <ShEditor className="h-48 mb-4 w-full overflow-x-auto" readOnly value={node.install.script} />
          </div>
        </>
      )}

      <DyoNodeConnectionInfo node={node} />
    </>
  )
}

export default DyoNodeSetup
