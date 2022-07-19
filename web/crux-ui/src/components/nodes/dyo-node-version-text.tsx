import { DyoTooltip } from '@app/elements/dyo-tooltip'
import useTranslation from 'next-translate/useTranslation'

export interface DyoNodeVersionTextProps {
  version: string
  className?: string
}

const DyoNodeVersionText = (props: DyoNodeVersionTextProps) => {
  const { t } = useTranslation('nodes')

  const versionSplit = props.version.split(' ')
  const visible = versionSplit[0]
  const tooltip = versionSplit[1]

  return (
    <>
      <DyoTooltip message={tooltip}>
        <span className={props.className}>{visible || t('versionUnknown')}</span>
      </DyoTooltip>
    </>
  )
}

export default DyoNodeVersionText
