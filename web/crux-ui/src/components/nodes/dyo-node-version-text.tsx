import DyoTooltip from '@app/elements/dyo-tooltip'
import useTranslation from 'next-translate/useTranslation'

export interface DyoNodeVersionTextProps {
  version: string
  className?: string
}

const DyoNodeVersionText = (props: DyoNodeVersionTextProps) => {
  const { version, className } = props

  const { t } = useTranslation('nodes')

  const versionSplit = version?.split(' ')
  const visibleVersion = versionSplit && versionSplit[0]
  const tooltip = (versionSplit && versionSplit[1]) || t('versionUnknown')

  return (
    <DyoTooltip message={tooltip}>
      <span className={className}>{(version && visibleVersion) || t('versionUnknown')}</span>
    </DyoTooltip>
  )
}

export default DyoNodeVersionText
