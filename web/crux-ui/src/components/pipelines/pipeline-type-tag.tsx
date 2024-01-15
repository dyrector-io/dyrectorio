import DyoTag from '@app/elements/dyo-tag'
import { PipelineType } from '@app/models'
import useTranslation from 'next-translate/useTranslation'

interface PipelineTypeTagProps {
  className?: string
  type: PipelineType
}

const PipelineTypeTag = (props: PipelineTypeTagProps) => {
  const { className, type } = props

  const { t } = useTranslation('pipelines')

  return (
    <DyoTag className={className} color="bg-dyo-blue" textColor="text-dyo-blue">
      {t(`type.${type}`).toUpperCase()}
    </DyoTag>
  )
}

export default PipelineTypeTag
