import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoIcon from '@app/elements/dyo-icon'
import DyoIndicator from '@app/elements/dyo-indicator'
import { ConvertedContainer, imageConfigToJsonContainerConfig } from '@app/models'
import { writeToClipboard } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { OFFLINE_EDITOR_STATE } from '../editor/use-item-editor-state'
import EditImageJson from '../projects/versions/images/edit-image-json'

type ConvertedContainerCardProps = {
  className?: string
  container: ConvertedContainer
  hasRegistry?: boolean
}

const ConvertedContainerCard = (props: ConvertedContainerCardProps) => {
  const { className, container, hasRegistry } = props

  const { t } = useTranslation('compose')

  const onCopy = () => writeToClipboard(t, JSON.stringify(container.config, undefined, 2))

  return (
    <DyoCard className={clsx('flex flex-col w-full', className ?? 'p-6')}>
      <div className="flex flex-row items-center justify-between">
        <DyoHeading element="h4" className="text-bright text-lg">{`${t('common:container')}: ${
          container.config.name
        }`}</DyoHeading>

        <DyoIcon size="md" src="/copy-alt.svg" alt={t('common:copy')} onClick={onCopy} />
      </div>

      <div className="flex flex-row items-center gap-2">
        <DyoIndicator
          color={hasRegistry ? 'bg-dyo-green' : 'bg-error-red'}
          title={t(hasRegistry ? 'registryFound' : 'missingRegistry')}
        />

        <span className="text-bright">{`${t('common:image')}: ${container.image}`}</span>
      </div>

      {!hasRegistry && <span className="text-error-red text-sm">{t('missingRegistry')}</span>}

      <div className="flex flex-col pt-2 mt-auto h-128">
        <EditImageJson
          disabled
          config={container.config}
          editorOptions={OFFLINE_EDITOR_STATE}
          onPatch={() => {}}
          onParseError={() => {}}
          convertConfigToJson={imageConfigToJsonContainerConfig}
        />
      </div>
    </DyoCard>
  )
}

export default ConvertedContainerCard
